# 14 — V7: resumo em Relatórios

**Implementar só depois da Fase 16 (V6 mergeada).** Uma fase:

- **Fase 17 — Relatórios**: resumo do mês no topo da aba, receitas por categoria ao lado das despesas.

Como na V3 a V6, **não há prints nem HTML**. Tudo reaproveita tokens, tipografia e componentes existentes (`SummarySlab`, `CategoryReport`, `MonthEmptyState`). Onde este documento não disser, siga a tela vizinha. Nada de cores, fontes, sombras, raios ou símbolos novos.

## Por que

A aba Relatórios só responde "para onde foi o dinheiro". Para entender o mês, o usuário precisa ir à Início ver receitas, despesas e resultado, e não tem em lugar nenhum de onde veio o dinheiro. A V7 concentra o balanço do mês em Relatórios: entradas, saídas, resultado e as duas quebras por categoria.

## Decisões de produto (já tomadas)

1. **Relatórios, na ordem**: stepper de mês; resumo do mês; `01` despesas por categoria; `02` receitas por categoria.
2. **O resumo é o `SummarySlab` da Início**, sem mudança: saldo acumulado, receitas do mês, despesas do mês e resultado do mês, com os mesmos rótulos da V2. Não tem índice de seção, como na Início.
3. **Receitas por categoria usam o mesmo componente** das despesas (`CategoryReport`), com barra e valores em `income`, valores com `+` e contagem em "entradas". Percentuais sobre o total de receitas do mês. "Sem categoria" sempre por último, como já é nas despesas.
4. **Mesmo período para tudo**: o stepper governa resumo e as duas seções. Sem comparação entre meses.
5. **Seção sem dados some.** Mês sem despesas mostra só a seção de receitas (e vice-versa); nesse caso a seção restante fica com índice `01`. Mês sem nenhuma movimentação mostra o resumo e o `MonthEmptyState` (textos já existentes `dash.monthEmpty*`) sem o cabeçalho da tabela de histórico (DATA, DESCRIÇÃO, TIPO, VALOR), no lugar do estado vazio atual de Relatórios.
6. **Drill-down de receitas** leva para `/movimentacoes?mes=…&categoria={id}`, como nas despesas. "Sem categoria" de receitas usa `categoria=sem-receita`; `categoria=sem` continua significando despesas sem categoria (links já existentes não mudam). Movimentações aceita `sem-receita` como filtro válido (hoje só `sem` ou um id, e o resto volta ao mês sem filtro) e mostra "Sem categoria" no título, como já faz com `sem`.
7. **Início não muda**: continua com o resumo e os 3 maiores gastos.

## Dados

Nenhuma migration. `category_totals(p_start, p_end, p_type)` (0005) já aceita `income`.

- `getCategoryTotals(month, type = "expense")` em `lib/dashboard.ts`.
- Resumo: mesma fonte do slab da Início (`transaction_summary` + totais do mês). Relatórios não busca o histórico: extrair a leitura do resumo de `getDashboardData` para uma função própria (`getMonthSummary`) usada pelas duas.
- Filtro `sem-receita` em `getDashboardData`: `category_id is null and type = 'income'`.
- `app/(app)/movimentacoes/page.tsx`: validação do parâmetro e nome exibido no título aceitam `sem-receita` além de `sem`.
- As três leituras rodam em paralelo; `ensureRecurrences()` (V6) já é chamada nelas.

## Componentes

- `CategoryReport` ganha `type: TransactionType` (padrão `expense`): cor da barra e do valor (`bg-income`/`text-income`), `formatIncome`, `copy.dash.incomeCount`, `id` de seção próprio (`relatorio-receitas`) para não repetir o `aria-labelledby`, link "Sem categoria" com `sem-receita`.
- `MonthEmptyState` ganha `tableHeader?: boolean` (padrão `true`); Relatórios usa `false`. Mesmos textos, mesmo bloco.
- `app/(app)/relatorios/page.tsx`: passa `summary` ao `DashboardView` e renderiza as seções. `loading.tsx` e `error.tsx` de Relatórios mostram o slab em carregando/erro, como a Início.

## Movimento

Reaproveita o da V5: barras crescem da esquerda com o `STAGGER` existente; troca de mês com a transição atual. Nada novo.

## Copy (adicionar a `04-copy.md` e `lib/copy.ts`, grupo `report`)

| Chave | Texto |
|---|---|
| report.incomeTitle(mês) | De onde veio o dinheiro em {mês}. |
| report.incomeTitleMobile | Receitas por categoria. |
| report.incomeRowLabel(categoria) | Ver receitas de {categoria} |

O aside "N CATEGORIAS · TOTAL R$ …" reusa `report.aside` com o total de receitas. `reports.emptyTitle` e `reports.emptyBody` deixam de ser usados (o mês vazio passa a usar `dash.monthEmpty*`) e saem de `lib/copy.ts`.

## Critérios de aceite (além de `07-criterios-de-aceite.md`)

**Fase 17**
- [ ] Resumo em Relatórios igual ao da Início para o mesmo mês (saldo, receitas, despesas, resultado).
- [ ] Soma das linhas de receitas = receitas do resumo; soma das despesas = despesas do resumo; percentuais de cada seção somam 100% (±0,1).
- [ ] Receitas por categoria em `income`, com `+`, "entradas" e "Sem categoria" por último.
- [ ] Drill-down de uma receita e de "Sem categoria" de receitas filtra Movimentações corretamente; `categoria=sem` continua mostrando só despesas.
- [ ] Mês só com despesas, só com receitas e sem nada: seções e índices corretos; mês vazio sem o cabeçalho da tabela de histórico.
- [ ] Relatórios não busca a lista de movimentações.
- [ ] Sem rolagem horizontal em 360px.
- [ ] `tsc`, `lint` e testes verdes; screenshots em 1440px e 390px, claro e escuro, em `docs/screenshots/fase-17/` e no PR.

## Fora desta versão

Gráficos além das barras existentes, comparação entre meses, evolução do saldo, intervalo de datas personalizado, exportar, orçamento, metas, receitas por categoria na Início.
