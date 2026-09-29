-- Segurança: privilégios mínimos nas tabelas e funções anteriores à V6.
-- Projetos com a exposição automática legada (conferido em produção) concedem ALL em toda tabela e
-- EXECUTE em toda função de `public` para anon e authenticated. A RLS limita as linhas ao dono, mas o
-- cliente ainda podia alterar colunas que o app nunca altera (ex.: categories.type, created_at) e anon
-- podia chamar as funções. Aqui tudo é revogado e só os grants de 0001 a 0006 são refeitos.
-- Idempotente: num projeto sem a exposição legada, não muda nada. (A 0008 já cobriu recurrences e transactions.)

-- Categorias: listar, criar, renomear e excluir as próprias (0004, 0006).
revoke all on public.categories from anon, authenticated;
grant select, insert, delete on public.categories to authenticated;
grant update (name) on public.categories to authenticated;

-- Perfil: ler e editar o próprio nome (0002, 0006). A criação é pelo trigger `handle_new_user`.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (name) on public.profiles to authenticated;

-- Resumo: só leitura (0002).
revoke all on public.transaction_summary from anon, authenticated;
grant select on public.transaction_summary to authenticated;

-- Funções chamadas pelo app: só authenticated.
revoke execute on function public.category_totals(date, date, public.transaction_type) from public, anon;
grant execute on function public.category_totals(date, date, public.transaction_type) to authenticated;
revoke execute on function public.category_usage() from public, anon;
grant execute on function public.category_usage() to authenticated;

-- Usada só dentro das RPCs security definer (0007), que rodam como dono.
revoke execute on function public.recurrence_date(date, smallint) from public, anon, authenticated;

-- Função de trigger: não é chamada pela API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
