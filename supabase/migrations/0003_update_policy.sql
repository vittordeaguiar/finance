-- Saldo. — V2: edição de movimentação
-- Cada usuário só altera as próprias movimentações; o `with check` impede trocar o dono.

create policy "update own" on public.transactions
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

grant update (type, description, amount_cents, occurred_at) on public.transactions to authenticated;
