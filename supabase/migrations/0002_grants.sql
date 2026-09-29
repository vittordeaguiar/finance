-- Saldo. — permissões da Data API
-- Projetos Supabase recentes não concedem acesso automático a tabelas/views novas.
-- Sem estes GRANTs, toda leitura falha com "permission denied" mesmo com RLS correta.
-- Mínimo necessário: só o papel `authenticated`; `anon` não acessa nada.

grant select, insert, delete on public.transactions to authenticated;
grant select on public.transaction_summary to authenticated;
grant select on public.profiles to authenticated;
