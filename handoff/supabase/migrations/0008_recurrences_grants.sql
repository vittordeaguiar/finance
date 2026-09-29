-- V6 / Fase 16: fixa os privilégios das tabelas da V6.
-- Projetos com a exposição automática legada (e o Supabase local) concedem ALL em toda tabela nova de
-- `public` para anon e authenticated. Aí os grants por coluna da 0007 não bastam: o cliente conseguiria
-- inserir séries, mover `next_due_on` e preencher `recurrence_id`. Aqui tudo é revogado e só o que o
-- doc 13 permite é concedido de novo. Idempotente: não muda nada num projeto sem a exposição legada.

revoke all on public.recurrences from anon, authenticated;
grant select on public.recurrences to authenticated;
grant update (description, amount_cents, category_id, ended_at) on public.recurrences to authenticated;

-- Revogar o privilégio da tabela também revoga os de coluna: os grants de 0002, 0003, 0004 e 0007
-- são refeitos abaixo, sem `recurrence_id` (nem `user_id`/`id`).
revoke all on public.transactions from anon, authenticated;
grant select, delete on public.transactions to authenticated;
grant insert (type, description, amount_cents, occurred_at, category_id) on public.transactions to authenticated;
grant update (type, description, amount_cents, occurred_at, category_id) on public.transactions to authenticated;
