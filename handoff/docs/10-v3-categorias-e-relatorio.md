# 10 — V3: categorias e relatório por categoria

**Não faz parte do MVP nem da V2.** Implementar só depois da Fase 7 (V2 mergeada). São duas fases, nesta ordem:

- **Fase 8 — Categorias**: cada movimentação pode ter **uma** categoria; escolher no formulário, ver no histórico.
- **Fase 9 — Relatório por categoria**: "para onde foi o dinheiro" no mês selecionado, com filtro do histórico por categoria.

Diferente das fases anteriores, **não há prints nem HTML** para estas telas. As decisões visuais abaixo reaproveitam componentes, tokens e padrões que já existem. Onde este documento não disser, siga o padrão da tela vizinha (mesmo espaçamento, mesma tipografia, mesmo componente). Não invente cores, fontes, sombras ou raios.

## Decisões de produto (já tomadas)

1. **Categoria, não tag.** Uma categoria por movimentação (ou nenhuma). Com tags múltiplas, somar por tag conta o mesmo gasto mais de uma vez, e o relatório deixa de fechar com o total do mês. Tags ficam para o futuro, se aparecer necessidade.
2. **Opcional.** A categoria não é obrigatória. Sem categoria = `null`, exibido como "Sem categoria". Movimentações antigas continuam válidas sem migração de dados.
3. **Categoria tem tipo.** Categorias de despesa (Mercado, Moradia…) e de receita (Salário, Freelance…) são listas separadas. O seletor mostra só as do tipo da movimentação. Isso é garantido no banco (ver "Dados").
4. **Lista inicial + categorias próprias.** Todo usuário começa com as categorias padrão abaixo. Ele pode criar novas direto no formulário. **Renomear e excluir categorias fica fora desta versão** (exigiria uma tela de configurações, que segue fora de escopo em `01-produto.md`).
5. **Sem cor por categoria.** O design system só tem cores semânticas (receita/despesa). Categorias se distinguem pelo **texto**, numa etiqueta neutra. Isso também atende "não depender só de cor" (`01-produto.md`, requisito 6).
6. **Relatório só de despesas.** A pergunta do produto é "para onde vai meu dinheiro". Receitas por categoria podem vir depois com o mesmo componente.

### Categorias padrão

| Tipo | Categorias (nesta ordem) |
|---|---|
| Despesa | Moradia, Mercado, Alimentação, Transporte, Saúde, Educação, Lazer, Assinaturas, Compras |
| Receita | Salário, Freelance, Vendas, Rendimentos |

## Dados (migration `0004_categories.sql`)

Criar em `supabase/migrations/` e copiar para `handoff/supabase/migrations/`, como nas anteriores. Atualizar a tabela de migrations do README.

```sql
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

-- Movimentação → categoria. A FK composta impede usar categoria de outro usuário
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
```

O SQL deste documento foi validado no Supabase local (Postgres 17): backfill, recusa da FK para categoria de outro usuário e de outro tipo, `on delete set null (category_id)` e a RPC abaixo sob RLS.

Observações para quem implementar:
- `on delete set null (category_id)` exige Postgres 15+ (o Supabase atual atende). Como excluir categoria está fora desta versão, isso só protege o futuro.
- A FK composta usa `MATCH SIMPLE` (padrão): com `category_id` nulo, a restrição não se aplica. É exatamente o comportamento de "sem categoria".
- **Trocar o tipo na edição** com categoria definida quebraria a FK. A interface limpa a categoria ao trocar o tipo (ver "Formulário"), e a Server Action deve mandar `category_id = null` nesse caso.

### Categorias padrão para cada usuário

Estender `public.handle_new_user()` (de `0001_init.sql`, via `create or replace function`) para inserir as categorias padrão junto com o perfil. Na mesma migration, fazer o **backfill** para usuários que já existem:

```sql
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
```

A ordem de exibição é alfabética (`order by name`), com "Sem categoria" sempre no topo do seletor. Não é preciso guardar a ordem da tabela acima.

### Totais por categoria (Fase 9)

Agregar no banco, não no cliente: a Data API corta respostas em 1000 linhas (o motivo da paginação em `lib/dashboard.ts`). Na migration da Fase 9 (`0005_category_totals.sql`):

```sql
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
```

`security invoker`: a RLS de `transactions` e `categories` continua valendo, então cada usuário só soma o que é dele. Chamar com `supabase.rpc("category_totals", { p_start, p_end, p_type: "expense" })`, reusando `monthRange()` de `lib/dates.ts`.

## Fase 8 — Categorias

### Server Actions (`app/(app)/actions.ts`)

- `createTransaction` e `updateTransaction` passam a ler dois campos opcionais do formulário:
  - `categoryId`: uuid de uma categoria existente, ou vazio para "Sem categoria".
  - `newCategory`: nome de uma categoria nova (1 a 30 caracteres após `trim`). Se vier preenchido, tem prioridade sobre `categoryId`.
- Validar com Zod em `lib/validation.ts` (estender `validateTransaction`, sem duplicar o schema). Erro do nome novo vai no campo `newCategory`.
- Categoria nova: inserir em `categories` com o `type` da movimentação. Se já existir uma com o mesmo nome (índice único), **reusar a existente** em vez de dar erro. Buscar pelo nome normalizado depois do conflito.
- `updateTransaction`: se o `type` mudou, gravar `category_id = null`, a não ser que o formulário tenha mandado uma categoria do novo tipo.
- Categoria inválida (outro usuário ou outro tipo) volta como erro do servidor genérico (a FK recusa). Não vazar detalhes.

### Leitura

- `lib/dashboard.ts`: incluir `category_id` e o nome da categoria na leitura do histórico (`select` com embed `category:categories(name)`, ou um segundo select). Atualizar `TRANSACTION_COLUMNS`, `TransactionRow`, `Transaction` (`categoryId: string | null`, `categoryName: string | null`) e `toTransaction` em `lib/transactions.ts`, com teste.
- Categorias do usuário: uma leitura por página (`select id, type, name from categories order by name`), passada pelo `DashboardProvider` para os formulários. Sem cache global.

### Componente `CategoryTag` (`components/ui/`)

Etiqueta neutra, irmã da `TypeTag` (mesma altura, `rounded-sm`, mono, `tracking-label`, caixa alta):
- Fundo `bg-surface`, borda `border border-border`, texto `text-text-secondary`.
- Tamanhos iguais aos da `TypeTag` (`xs`, `sm`, `md`).
- Nome truncado com reticências a partir de 16 caracteres na tabela (`title` com o nome completo).
- "Sem categoria" **não** mostra etiqueta no histórico (evita ruído). Só no card de detalhe aparece o texto "Sem categoria".

### Formulário (criação e edição)

Campo novo `CATEGORIA`, **depois de DESCRIÇÃO e antes de VALOR** (a categoria costuma ser decidida junto com a descrição):
- `<select>` nativo, estilizado como os inputs (`FieldShell` + `inputClass` de `components/ui/Field.tsx`). O nativo dá acessibilidade e o seletor do próprio celular sem custo.
- Opções: "Sem categoria" (valor vazio), as categorias do tipo em ordem alfabética, e por último "+ Nova categoria…".
- Ao escolher "+ Nova categoria…", aparece logo abaixo um `TextField` "NOME DA CATEGORIA" (`maxLength={30}`, foco automático). Voltar a outra opção esconde e limpa o campo.
- Criação: padrão "Sem categoria".
- Edição: pré-selecionada a categoria atual; alteração ganha o `ChangedNote` "ALTERADO · ERA {categoria anterior}" (ou "ERA SEM CATEGORIA"), como os outros campos. **Ao trocar o tipo**, a categoria volta para "Sem categoria", e a marca de alterado aparece se antes havia uma.
- Deep link `/?novo=despesa` continua funcionando (categoria vazia).

### Histórico

- **Desktop (tabela)**: a `CategoryTag` (`sm`) vai na célula DESCRIÇÃO, à direita do texto, com `gap-3` (mesmo lugar onde a `TypeTag` aparece entre 768 e 1100px; nessa faixa as duas etiquetas ficam lado a lado). A grade `TABLE_GRID` não muda.
- **Mobile (lista)**: a linha de metadados vira `22 SET · ↘ DESPESA · MERCADO` (nome em caixa alta, `text-text-secondary`). Sem categoria, fica como hoje.
- **Detalhe (mobile) e card de exclusão**: `TransactionCard` mostra a `CategoryTag` (`xs`) ao lado da `TypeTag`, ou o texto "Sem categoria".

### Copy nova (Fase 8)

| Chave | Texto |
|---|---|
| category.label | CATEGORIA |
| category.none | Sem categoria |
| category.new_option | + Nova categoria… |
| category.new_label | NOME DA CATEGORIA |
| category.new_placeholder | Ex.: Pets |
| category.error.new_required | Informe o nome da categoria. |
| category.error.new_long | Use no máximo 30 caracteres. |
| edit.changed.none | SEM CATEGORIA |

Toasts de criar e editar **não mudam**.

## Fase 9 — Relatório por categoria

### Onde fica

Nova seção no dashboard, **entre o slab e o histórico**, com o `SectionIndex` "02". O histórico passa a ser "03".
- Título: "Para onde foi o dinheiro em {mês}." (mobile: "Gastos por categoria.").
- À direita (desktop), mono: `{n} CATEGORIAS · TOTAL − R$ {total}`.
- Só aparece quando o mês selecionado tem pelo menos uma despesa. Sem despesas no mês, a seção some (o histórico já mostra o estado de mês vazio).

### Visual (sem biblioteca de gráficos)

Uma lista de barras horizontais dentro de um card `border border-border bg-surface`, como a tabela:
- Cada linha: nome da categoria (ou "Sem categoria", sempre por último), barra, valor `− R$ …` (`tabular`, `text-expense`), percentual mono (`34,2%`) e contagem em `text-text-secondary` ("5 saídas", reusando `copy.dash.expenseCount`).
- Barra: trilho `bg-surface-muted`, preenchimento `bg-expense`, altura 8px, `rounded-none` (raio máximo do design system é 2px). A largura é **a participação no total do mês**, então as barras somam 100%.
- Percentual: calcular em milésimos inteiros (`Math.round(total * 1000 / soma)`) e formatar com uma casa (`34,2%`). Dinheiro continua em centavos, e o percentual não é dinheiro.
- Desktop: grade `[minmax(0,1fr)_2fr_auto_auto]` (nome, barra, valor, %), linhas de 56px como a tabela. Mobile: nome e valor na primeira linha, barra e percentual na segunda.
- Animação: a barra cresce de 0 à largura final (Motion, `FAST`, só `scaleX` com `origin-left`), junto com a troca de mês. `prefers-reduced-motion` já zera pelo `MotionProvider`.
- Acessibilidade: a lista é `<ol>` com `aria-label` do título; cada barra é decorativa (`aria-hidden`), porque o valor e o percentual já estão em texto.

### Filtro do histórico por categoria (drill-down)

- Cada linha do relatório é um `<Link>` para `/?mes={mês}&categoria={id}` (ou `categoria=sem` para "Sem categoria"). O mês atual continua sem `mes=`.
- Com filtro ativo, o histórico mostra só aquela categoria. O título vira "Movimentações de {mês} em {categoria}." e aparece, ao lado do título, um chip `{CATEGORIA} ×` que remove o filtro (link sem `categoria=`, mesmo estilo da `CategoryTag` `md`, com o × como botão de 44px).
- O **slab não muda** com o filtro: saldo, receitas e despesas continuam do mês inteiro. O filtro é só da lista.
- Categoria inexistente ou de outro usuário no parâmetro: redirecionar para o mesmo mês sem `categoria=` (mesmo padrão do `?mes=` inválido).
- "Mostrar mais" (`?itens=`) preserva `mes` e `categoria`. Generalizar `moreItemsHref` em `app/(app)/page.tsx`.
- **Trocar de mês limpa o filtro**: os links do seletor de mês não levam `categoria=`. Assim nunca se chega a um mês filtrado por uma categoria sem movimentações nele.

### Copy nova (Fase 9)

| Chave | Texto |
|---|---|
| report.index | 02 |
| report.title | Para onde foi o dinheiro em {mês}. |
| report.title.mobile | Gastos por categoria. |
| report.aside | {n} CATEGORIAS · TOTAL {valor com sinal} |
| report.aside.one | 1 CATEGORIA · TOTAL {valor com sinal} |
| report.row_label | Ver movimentações de {categoria} |
| dash.history.index | 03 (era 02) |
| dash.history.title.filtered | Movimentações de {mês} em {categoria}. |
| dash.filter.remove | Remover filtro {categoria} |

`report.row_label` e `dash.filter.remove` são `aria-label`.

## Critérios de aceite (além de `07-criterios-de-aceite.md`)

**Fase 8**
- [ ] Usuário novo já tem as 13 categorias padrão; usuários antigos também (backfill).
- [ ] Criar e editar com categoria existente, com categoria nova (inclusive nome repetido com outra caixa, que reusa a existente) e sem categoria.
- [ ] Trocar o tipo na edição limpa a categoria; salvar funciona.
- [ ] Usuário B não vê nem usa categorias de A (testar via API com id alheio: a FK recusa).
- [ ] Categoria aparece na tabela, na lista mobile e no detalhe; "Sem categoria" não polui o histórico.
- [ ] Sem rolagem horizontal em 360px com nomes longos (truncados).

**Fase 9**
- [ ] Soma das linhas do relatório = total de despesas do mês no slab, e percentuais somam 100% (±0,1 pelo arredondamento).
- [ ] Mais de 1000 despesas no mês continuam somando certo (agregado no banco).
- [ ] Drill-down filtra a lista, o chip remove o filtro, `categoria` inválida redireciona.
- [ ] Seção some em mês sem despesas; relatório e histórico acompanham a troca de mês.
- [ ] Com reduced-motion, barras aparecem já no tamanho final.

**Ambas**
- [ ] `tsc`, `lint` e testes verdes; testes unitários novos para validação da categoria, `toTransaction` e o cálculo de percentual.
- [ ] Screenshots em 1440px e 390px das telas novas anexados ao PR (substituem os prints que não existem), para revisão visual.

## Fora desta versão

Renomear, excluir ou reordenar categorias; cor ou ícone por categoria; tags múltiplas; orçamento por categoria; relatório de receitas; comparação entre meses; exportar. Se surgir necessidade, pare e pergunte.
