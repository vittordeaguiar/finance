-- V6 / Fase 15: movimentações recorrentes mensais.
-- A série guarda até onde já lançou (next_due_on); cada ocorrência é uma linha comum em transactions.

create table public.recurrences (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  type         public.transaction_type not null,
  description  text not null check (char_length(btrim(description)) between 1 and 80),
  amount_cents bigint not null check (amount_cents > 0 and amount_cents <= 99999999999),
  category_id  uuid,
  day_of_month smallint not null check (day_of_month between 1 and 31),
  next_due_on  date not null,            -- próxima data a lançar (cursor da geração)
  ended_at     timestamptz,              -- não nulo = encerrada
  created_at   timestamptz not null default now(),
  unique (id, user_id, type),
  foreign key (category_id, user_id, type)
    references public.categories (id, user_id, type) on delete set null (category_id)
);

create index recurrences_user_active_idx on public.recurrences (user_id) where ended_at is null;

alter table public.transactions add column recurrence_id uuid;
alter table public.transactions
  add constraint transactions_recurrence_fk
  foreign key (recurrence_id, user_id, type)
  references public.recurrences (id, user_id, type)
  on delete set null (recurrence_id);

-- Trava contra lançamento duplicado em chamadas concorrentes.
create unique index transactions_recurrence_date_idx
  on public.transactions (recurrence_id, occurred_at) where recurrence_id is not null;

alter table public.recurrences enable row level security;

create policy "select own" on public.recurrences
  for select to authenticated using (user_id = (select auth.uid()));
create policy "insert own" on public.recurrences
  for insert to authenticated with check (user_id = (select auth.uid()));
-- Só séries ativas: encerrar é definitivo (ended_at não volta a null).
create policy "update own" on public.recurrences
  for update to authenticated
  using (user_id = (select auth.uid()) and ended_at is null)
  with check (user_id = (select auth.uid()));

-- Sem insert direto e sem update de next_due_on: criar a série e mover o cursor só pelas RPCs.
grant select on public.recurrences to authenticated;
grant update (description, amount_cents, category_id, ended_at) on public.recurrences to authenticated;

-- Insert por coluna: o cliente não preenche recurrence_id (nem user_id/id, que vêm dos defaults).
revoke insert on public.transactions from authenticated;
grant insert (type, description, amount_cents, occurred_at, category_id) on public.transactions to authenticated;

-- Dia p_day do mês de p_month, limitado ao último dia desse mês. Espelhado em lib/recurrence.ts.
create function public.recurrence_date(p_month date, p_day smallint)
returns date
language sql immutable set search_path = ''
as $$
  select (date_trunc('month', p_month)::date
          + (least(p_day::int,
                   extract(day from (date_trunc('month', p_month) + interval '1 month - 1 day'))::int) - 1));
$$;

-- Lança as ocorrências vencidas de uma série do usuário da sessão e avança o cursor.
-- Interna: só chamada pelas RPCs abaixo.
create function public.materialize_recurrence(p_id uuid)
returns integer
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid   uuid := auth.uid();
  v_today date := (now() at time zone 'America/Sao_Paulo')::date;
  r       public.recurrences%rowtype;
  v_date  date;
  v_count integer := 0;
  v_rows  integer;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  select * into r from public.recurrences
  where id = p_id and user_id = v_uid and ended_at is null
  for update;
  if not found then
    return 0;
  end if;

  v_date := r.next_due_on;
  while v_date <= v_today loop
    insert into public.transactions
      (user_id, type, description, amount_cents, occurred_at, category_id, recurrence_id)
    values (v_uid, r.type, r.description, r.amount_cents, v_date, r.category_id, r.id)
    on conflict (recurrence_id, occurred_at) where recurrence_id is not null do nothing;
    get diagnostics v_rows = row_count;
    v_count := v_count + v_rows;
    v_date := public.recurrence_date((date_trunc('month', v_date) + interval '1 month')::date, r.day_of_month);
  end loop;

  if v_date <> r.next_due_on then
    update public.recurrences set next_due_on = v_date where id = r.id and user_id = v_uid;
  end if;

  return v_count;
end;
$$;

revoke execute on function public.materialize_recurrence(uuid) from public, anon, authenticated;

create function public.materialize_recurrences()
returns integer
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid   uuid := auth.uid();
  v_today date := (now() at time zone 'America/Sao_Paulo')::date;
  v_id    uuid;
  v_count integer := 0;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  -- skip locked: uma chamada concorrente pula a série que outra já está lançando.
  for v_id in
    select id from public.recurrences
    where user_id = v_uid and ended_at is null and next_due_on <= v_today
    for update skip locked
  loop
    v_count := v_count + public.materialize_recurrence(v_id);
  end loop;

  return v_count;
end;
$$;

revoke execute on function public.materialize_recurrences() from public, anon;
grant execute on function public.materialize_recurrences() to authenticated;

-- Cria a série e lança a primeira ocorrência (e os meses até hoje) de forma atômica.
create function public.create_recurrence(
  p_type         public.transaction_type,
  p_description  text,
  p_amount_cents bigint,
  p_category_id  uuid,
  p_start        date
)
returns table (recurrence_id uuid, transaction_id uuid, inserted integer)
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid   uuid := auth.uid();
  v_today date := (now() at time zone 'America/Sao_Paulo')::date;
  v_id    uuid;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;
  if p_start is null or p_start > v_today then
    raise exception 'start_in_future' using errcode = '22023';
  end if;
  if p_start < (v_today - interval '12 months')::date then
    raise exception 'start_too_old' using errcode = '22023';
  end if;
  if p_category_id is not null and not exists (
    select 1 from public.categories c
    where c.id = p_category_id and c.user_id = v_uid and c.type = p_type
  ) then
    raise exception 'invalid_category' using errcode = '22023';
  end if;

  insert into public.recurrences
    (user_id, type, description, amount_cents, category_id, day_of_month, next_due_on)
  values
    (v_uid, p_type, btrim(p_description), p_amount_cents, p_category_id,
     extract(day from p_start)::smallint, p_start)
  returning id into v_id;

  inserted := public.materialize_recurrence(v_id);
  recurrence_id := v_id;
  select t.id into transaction_id from public.transactions t
  where t.recurrence_id = v_id and t.user_id = v_uid and t.occurred_at = p_start;
  return next;
end;
$$;

revoke execute on function public.create_recurrence(public.transaction_type, text, bigint, uuid, date) from public, anon;
grant execute on function public.create_recurrence(public.transaction_type, text, bigint, uuid, date) to authenticated;
