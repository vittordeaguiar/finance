# 09 — V2: filtro por mês e edição

**Não faz parte do MVP.** Implementar só depois das Fases 0–6. Prints 40–51 em `design/prints/`.

## Filtro por mês

### Regra de negócio (a decisão mais importante)
- **Saldo atual continua acumulado** (todas as movimentações até hoje), independente do mês selecionado. O saldo é um fato do presente, não do período.
- **Receitas, despesas e contagens passam a ser do mês selecionado.** Labels mudam para `↗ RECEITAS EM SET` / `↘ DESPESAS EM SET` (mobile: `↗ RECEITAS · SET`).
- Nova faixa no slab: `RESULTADO DE SETEMBRO 2026` + valor (receitas − despesas do mês) + "receitas menos despesas do mês". Pode ser negativo (`− R$ …`).
- Histórico mostra só o mês: título "Movimentações de setembro."

### Controle
- Stepper `‹ SETEMBRO 2026 ›`: botões de 44px, label mono 13px com `aria-live="polite"`.
- `›` desabilitado no mês atual (não há mês futuro com dados, já que datas futuras são bloqueadas).
- Fora do mês atual aparece o link "Voltar para o mês atual →".
- Desktop: linha própria entre o título e o slab, com label `PERÍODO`. Mobile: logo abaixo do header, largura total.
- Estado na URL: `/?mes=2026-08`. Sem parâmetro = mês atual (fuso `America/Sao_Paulo`). Valor inválido ou futuro → redireciona para o mês atual. Navegação via `<Link>`, então o Server Component refaz a busca.

### Mês sem movimentações (42, 45)
`00 MOVIMENTAÇÕES EM JULHO 2026` / "Nada registrado em julho." / "Troque o período acima ou registre uma movimentação com data deste mês." Receitas e despesas `R$ 0,00`, saldo atual continua o acumulado.

### Dados
```sql
-- resumo do mês (occurred_at >= inicio and occurred_at < inicio + 1 month)
select
  coalesce(sum(amount_cents) filter (where type='income'),0)  as income_cents,
  coalesce(sum(amount_cents) filter (where type='expense'),0) as expense_cents,
  count(*) filter (where type='income')  as income_count,
  count(*) filter (where type='expense') as expense_count
from transactions
where occurred_at >= $1 and occurred_at < ($1::date + interval '1 month');
```
O índice `(user_id, occurred_at desc, created_at desc)` já cobre o filtro. Saldo atual segue vindo de `transaction_summary`.

Ao criar uma movimentação com data em outro mês, o toast avisa: "Salva em agosto de 2026." com link "Ver agosto".

## Edição de movimentação

### Onde fica
- Desktop (46): botão "Editar" (verde, antes de "Excluir") em cada linha → modal 520px.
- Mobile (48): o sheet de detalhe ganha "Editar movimentação" (primário) acima de "Excluir movimentação" (outline vermelho). Tocar em Editar troca o conteúdo do mesmo sheet para o formulário (49).

### Formulário
- Eyebrow `EDITAR MOVIMENTAÇÃO`, título "Editar receita." / "Editar despesa." (segue o tipo selecionado).
- **Tipo editável** via controle segmentado `↗ RECEITA | ↘ DESPESA` (`role="radiogroup"`). Diferente da criação, onde o tipo é fixo: corrigir o botão errado é o principal motivo de edição. O prefixo `+ R$` / `− R$` e as cores acompanham a seleção.
- Campos preenchidos com os valores atuais. Campo alterado ganha borda verde `#183f32` e a marca mono `ALTERADO · ERA R$ 412,80` (ou o valor/descrição/data anterior).
- Aviso info com o impacto: "O saldo passa de **R$ A** para **R$ B**." Só aparece quando valor ou tipo mudam.
- "Salvar alterações" desabilitado enquanto nada mudou.
- Estados: salvando (50, igual à criação), erro de validação (mesmas mensagens da criação), erro de servidor.

### Depois de salvar (47, 51)
- Linha atualizada destacada por ~3s; totais recalculados.
- Toast `DESPESA ATUALIZADA` / `RECEITA ATUALIZADA` + "Supermercado agora é − R$ 432,80. Saldo: R$ 5.819,75."
- Se a data mudou para outro mês, a linha sai da lista atual e o toast diz "Movida para agosto de 2026." com link "Ver agosto".

### Backend
```sql
create policy "update own" on public.transactions
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
```
Server Action `updateTransaction(id, formData)` com o mesmo schema Zod da criação + `type`. Opcional: coluna `updated_at timestamptz` com trigger, para exibir "editada" no detalhe no futuro.

## Copy nova

| Chave | Texto |
|---|---|
| period.label | PERÍODO |
| period.prev / next (aria) | Mês anterior / Próximo mês |
| period.back | Voltar para o mês atual → |
| dash.balance.caption.v2 | Acumulado de todas as movimentações até hoje. |
| dash.balance.label.mobile.v2 | SALDO ATUAL · ACUMULADO |
| dash.income.label.v2 | ↗ RECEITAS EM {MÊS} |
| dash.expense.label.v2 | ↘ DESPESAS EM {MÊS} |
| dash.result.label | RESULTADO DE {MÊS ANO} (mobile: RESULTADO DO MÊS) |
| dash.result.caption | receitas menos despesas do mês |
| dash.history.title.v2 | Movimentações de {mês}. |
| dash.month_empty.index | 00 MOVIMENTAÇÕES EM {MÊS ANO} |
| dash.month_empty.title | Nada registrado em {mês}. |
| dash.month_empty.body | Troque o período acima ou registre uma movimentação com data deste mês. |
| edit.eyebrow | EDITAR MOVIMENTAÇÃO |
| edit.title | Editar receita. / Editar despesa. |
| edit.type | TIPO |
| edit.changed | ALTERADO · ERA {valor anterior} |
| edit.impact | O saldo passa de R$ {antes} para R$ {depois}. |
| edit.submit | Salvar alterações |
| edit.detail.action | Editar movimentação |
| edit.row.action | Editar |
| edit.toast.title | RECEITA ATUALIZADA / DESPESA ATUALIZADA |
| edit.toast.body | {descrição} agora é {valor com sinal}. Saldo: R$ {saldo}. |
| edit.toast.moved | Movida para {mês} de {ano}. Ver {mês} |
