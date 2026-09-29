-- V4 / Fase 12: configurações (renomear/excluir categorias, editar o nome do perfil, uso por categoria).

-- Categorias: renomear e excluir as próprias
create policy "update own" on public.categories
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "delete own" on public.categories
  for delete to authenticated using (user_id = (select auth.uid()));
grant update (name), delete on public.categories to authenticated;

-- Perfil: editar o próprio nome
create policy "update own profile" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));
grant update (name) on public.profiles to authenticated;

create function public.category_usage()
returns table (category_id uuid, tx_count bigint)
language sql stable security invoker set search_path = ''
as $$
  select t.category_id, count(*) from public.transactions t
  where t.category_id is not null group by t.category_id;
$$;
grant execute on function public.category_usage() to authenticated;
