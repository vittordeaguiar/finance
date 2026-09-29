-- V3 / Fase 9: totais por categoria no mês, agregados no banco (a Data API corta respostas em 1000 linhas).
-- security invoker: a RLS de transactions e categories continua valendo.

create function public.category_totals(p_start date, p_end date, p_type public.transaction_type)
returns table (category_id uuid, name text, total_cents bigint, tx_count bigint)
language sql stable security invoker set search_path = ''
as $$
  select t.category_id, c.name, sum(t.amount_cents)::bigint, count(*)
  from public.transactions t
  left join public.categories c on c.id = t.category_id
  where t.type = p_type and t.occurred_at >= p_start and t.occurred_at < p_end
  group by t.category_id, c.name
  order by 3 desc;
$$;

grant execute on function public.category_totals(date, date, public.transaction_type) to authenticated;
