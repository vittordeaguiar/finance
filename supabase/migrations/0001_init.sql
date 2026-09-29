-- Saldo. — migração inicial
-- Valores em centavos (inteiro). Nunca usar float para dinheiro.

create type public.transaction_type as enum ('income', 'expense');

create table public.transactions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  type         public.transaction_type not null,
  description  text not null check (char_length(btrim(description)) between 1 and 80),
  amount_cents bigint not null check (amount_cents > 0 and amount_cents <= 99999999999),
  occurred_at  date not null default current_date,
  created_at   timestamptz not null default now()
);

-- Histórico: mais recentes primeiro, desempate pela criação
create index transactions_user_order_idx
  on public.transactions (user_id, occurred_at desc, created_at desc);

alter table public.transactions enable row level security;

create policy "select own" on public.transactions
  for select to authenticated using (user_id = (select auth.uid()));

create policy "insert own" on public.transactions
  for insert to authenticated with check (user_id = (select auth.uid()));

create policy "delete own" on public.transactions
  for delete to authenticated using (user_id = (select auth.uid()));

-- Sem policy de update: edição está fora do escopo do MVP.

-- Resumo por usuário (respeita RLS por ser security_invoker)
create view public.transaction_summary
with (security_invoker = true) as
select
  user_id,
  coalesce(sum(amount_cents) filter (where type = 'income'), 0)::bigint  as income_cents,
  coalesce(sum(amount_cents) filter (where type = 'expense'), 0)::bigint as expense_cents,
  coalesce(sum(case when type = 'income' then amount_cents else -amount_cents end), 0)::bigint as balance_cents,
  count(*) filter (where type = 'income')  as income_count,
  count(*) filter (where type = 'expense') as expense_count
from public.transactions
group by user_id;

-- Perfil mínimo para guardar o nome informado no cadastro
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  name       text not null check (char_length(btrim(name)) between 1 and 80),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "select own profile" on public.profiles
  for select to authenticated using (id = (select auth.uid()));

-- Cria o perfil a partir do metadata enviado no signUp ({ data: { name } })
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(nullif(btrim(new.raw_user_meta_data ->> 'name'), ''), 'Usuário'));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
