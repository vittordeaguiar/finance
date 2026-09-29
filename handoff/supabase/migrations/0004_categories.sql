-- V3 / Fase 8: categorias (uma por movimentação, opcional, com tipo).

create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  type       public.transaction_type not null,
  name       text not null check (char_length(btrim(name)) between 1 and 30),
  created_at timestamptz not null default now(),
  -- alvo da FK composta de transactions (garante dono e tipo iguais)
  unique (id, user_id, type)
);

-- Sem nomes repetidos por usuário e tipo, ignorando maiúsculas e espaços nas pontas
create unique index categories_user_type_name_idx
  on public.categories (user_id, type, lower(btrim(name)));

alter table public.categories enable row level security;

create policy "select own" on public.categories
  for select to authenticated using (user_id = (select auth.uid()));
create policy "insert own" on public.categories
  for insert to authenticated with check (user_id = (select auth.uid()));

grant select, insert on public.categories to authenticated;

-- Movimentação -> categoria. A FK composta impede usar categoria de outro usuário
-- ou de outro tipo (ex.: categoria de receita numa despesa).
alter table public.transactions add column category_id uuid;
alter table public.transactions
  add constraint transactions_category_fk
  foreign key (category_id, user_id, type)
  references public.categories (id, user_id, type)
  on delete set null (category_id);

create index transactions_user_category_idx
  on public.transactions (user_id, category_id, occurred_at);

grant update (category_id) on public.transactions to authenticated;

-- Categorias padrão: usuários novos (trigger) e existentes (backfill).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(nullif(btrim(new.raw_user_meta_data ->> 'name'), ''), 'Usuário'));

  insert into public.categories (user_id, type, name)
  select new.id, d.type, d.name
  from (values
    ('expense'::public.transaction_type, 'Moradia'), ('expense', 'Mercado'), ('expense', 'Alimentação'),
    ('expense', 'Transporte'), ('expense', 'Saúde'), ('expense', 'Educação'), ('expense', 'Lazer'),
    ('expense', 'Assinaturas'), ('expense', 'Compras'),
    ('income', 'Salário'), ('income', 'Freelance'), ('income', 'Vendas'), ('income', 'Rendimentos')
  ) as d(type, name)
  on conflict do nothing;

  return new;
end;
$$;

insert into public.categories (user_id, type, name)
select u.id, d.type, d.name
from auth.users u
cross join (values
  ('expense'::public.transaction_type, 'Moradia'), ('expense', 'Mercado'), ('expense', 'Alimentação'),
  ('expense', 'Transporte'), ('expense', 'Saúde'), ('expense', 'Educação'), ('expense', 'Lazer'),
  ('expense', 'Assinaturas'), ('expense', 'Compras'),
  ('income', 'Salário'), ('income', 'Freelance'), ('income', 'Vendas'), ('income', 'Rendimentos')
) as d(type, name)
on conflict do nothing;
