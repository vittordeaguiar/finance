# 13 — V6: movimentações recorrentes

**Implementar só depois da Fase 14 (V5 mergeada).** São duas fases, nesta ordem:

- **Fase 15 — Dados**: tabela `recurrences`, vínculo em `transactions`, RPC de geração e testes de datas.
- **Fase 16 — Interface**: opção "Repetir todo mês" no formulário, marca nas linhas, seção Recorrências em Configurações.

Como na V3 e na V4, **não há prints nem HTML**. Tudo reaproveita tokens, tipografia e componentes existentes. Onde este documento não disser, siga a tela vizinha. Nada de cores, fontes, sombras, raios ou símbolos novos.

## Por que

Salário, aluguel, assinaturas e contas fixas se repetem todo mês. Hoje o usuário precisa lançar cada uma à mão, todo mês, e esquece. A V6 permite cadastrar a movimentação uma vez e deixar o app lançar as próximas.

## Decisões de produto (já tomadas)

1. **Só mensal.** Sem semanal, anual ou "a cada N meses". A recorrência repete no mesmo dia do mês da primeira ocorrência. Em meses mais curtos, cai no último dia (dia 31 vira 30 em abril, 28 ou 29 em fevereiro), e no mês seguinte volta ao dia original.
2. **Ocorrências são movimentações de verdade.** Cada uma é uma linha em `transactions`: aparece no histórico, soma no saldo, entra no relatório e pode ser editada ou excluída como qualquer outra. Editar ou excluir uma ocorrência **não** afeta a série nem as outras ocorrências.
3. **Geração sob demanda, até hoje.** Não há job agendado. Uma RPC idempotente lança as ocorrências vencidas (data ≤ hoje em São Paulo) sempre que o usuário abre o app. O saldo nunca inclui valor futuro.
4. **Sem previsão.** Meses futuros mostram só o que já foi lançado. Não há linhas "previstas" nem totais projetados (fica para uma versão futura).
5. **A primeira ocorrência é a própria movimentação criada.** Marcar "Repetir todo mês" no formulário cria a movimentação na data escolhida (hoje ou passado, como já é hoje) e a série a partir dela. Se a data for no passado, os meses entre ela e hoje são lançados na mesma hora.
6. **Uma ocorrência não muda de tipo.** O formulário de edição esconde o controle de receita/despesa quando a movimentação tem `recurrenceId` (e a Server Action recusa a troca). A FK composta exige que ocorrência e série tenham o mesmo tipo; para corrigir, o usuário exclui a ocorrência e lança outra avulsa.
7. **Editar a série vale só daqui para frente.** Descrição, valor e categoria alterados na série afetam as próximas ocorrências. As já lançadas não mudam (o usuário edita uma por uma, se quiser). O tipo e o dia não podem ser alterados; para isso, encerre a série e crie outra.
8. **Encerrar, não excluir.** "Encerrar recorrência" para de lançar ocorrências novas e mantém todas as já lançadas. A série encerrada some da lista de Configurações. Não há "reativar".
9. **Excluir uma ocorrência não a recria.** A série guarda até onde já lançou (`next_due_on`), então uma ocorrência excluída pelo usuário não volta na próxima geração.
10. **Sem data de término e sem número de parcelas.** A série dura até ser encerrada. Parcelamento é outra funcionalidade, fora desta versão.

## Dados (migration `0007_recurrences.sql`)

Os arquivos de migration ficam em `handoff/supabase/migrations/`, como os anteriores.

```sql
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
```

- **RLS** em `recurrences` igual às outras tabelas: `select`, `insert` e `update` só do dono (`user_id = (select auth.uid())`). Sem `delete` (encerrar é `update ended_at`).
- **Grants** em `recurrences`: só `select` e `update (description, amount_cents, category_id, ended_at)` para `authenticated`. Sem `insert` direto e sem update de `next_due_on`: criar a série e mover o cursor só acontecem pelas RPCs abaixo.
- **Grants** em `transactions`: o `insert` hoje é da tabela inteira (`0002_grants.sql`), o que deixaria o cliente preencher `recurrence_id` e forjar ocorrências (o índice único faria a geração pular a legítima). A migration troca por insert por coluna:
  ```sql
  revoke insert on public.transactions from authenticated;
  grant insert (type, description, amount_cents, occurred_at, category_id) on public.transactions to authenticated;
  ```
  `user_id` e `id` continuam vindo dos defaults. `recurrence_id` não tem grant de insert nem de update: o vínculo só nasce na geração e não muda.
- A FK composta garante que a ocorrência tem o mesmo dono e o mesmo tipo da série, como já é feito com categorias.

### Cálculo da data

Função pura `public.recurrence_date(p_month date, p_day smallint) returns date`, `immutable`: o dia `p_day` do mês de `p_month`, limitado ao último dia desse mês. O mesmo cálculo existe em TypeScript (`lib/recurrence.ts`) para a interface e para os testes; os dois precisam concordar.

### Por que as RPCs são `security definer`

A geração precisa mover `next_due_on` e preencher `recurrence_id`, e o usuário não pode fazer nenhum dos dois direto (ver Grants). Por isso as duas RPCs são `security definer` com `set search_path = ''`, como `handle_new_user` já é. Regras obrigatórias em ambas:

- a primeira linha lê `auth.uid()` e lança erro se for nulo;
- **toda** leitura e escrita filtra por `user_id = auth.uid()` (a RLS não se aplica ao dono da função);
- nenhum parâmetro recebe `user_id`;
- `revoke execute … from public, anon` e `grant execute … to authenticated`.

Continua valendo a regra do projeto: o app nunca usa `service_role`.

### RPC `materialize_recurrences()`

```
create function public.materialize_recurrences() returns integer
language plpgsql security definer set search_path = ''
```

- Hoje = `(now() at time zone 'America/Sao_Paulo')::date`. **Não** recebe data do cliente.
- Para cada série do usuário com `ended_at is null and next_due_on <= hoje`, travada com `select … for update skip locked`:
  - insere uma movimentação para cada data de `next_due_on` até hoje, mês a mês (`recurrence_date` do mês seguinte), com os dados **atuais** da série e `recurrence_id` preenchido, usando `on conflict do nothing` no índice único;
  - atualiza `next_due_on` para a primeira data depois de hoje.
- Retorna quantas movimentações inseriu.
- Sem limite de ocorrências por chamada: a data inicial é limitada a 12 meses atrás (ver `create_recurrence`), e uma série parada só acumula os meses em que o usuário não abriu o app.

### RPC `create_recurrence(...)`

Criar a série e a primeira movimentação precisa ser atômico. Uma função `security definer` (mesmas regras acima) recebe tipo, descrição, valor, categoria e data inicial, e:

- insere a série com `day_of_month` = dia da data inicial e `next_due_on` = data inicial;
- chama a mesma lógica de geração para essa série (a primeira ocorrência e os meses até hoje);
- retorna o `id` da série e o `id` da primeira movimentação (para o destaque e o toast).

A data inicial não pode ser no futuro (regra que já existe) nem anterior a 12 meses atrás (erro `recurrence.errorDateOld`). A RPC valida as duas coisas de novo, além da Server Action, e valida que a categoria, se houver, é do usuário e do mesmo tipo.

## Onde chamar a geração

- `lib/recurrence.ts` exporta `ensureRecurrences()`, envolvida em `cache()` do React: no máximo uma chamada da RPC por requisição.
- As funções de leitura de `lib/dashboard.ts` (`getDashboardData`, `getCategoryTotals` e as da aba Movimentações) fazem `await ensureRecurrences()` antes de consultar. Assim, qualquer aba que mostre dados já os mostra atualizados, sem depender da ordem entre layout e página.
- Se a RPC falhar, o app segue com os dados que tem (sem tela de erro), e a próxima abertura tenta de novo.

## Fase 15 — Dados

- Migration `0007_recurrences.sql` conforme acima, aplicada no Supabase do projeto.
- Tipos em `lib/transactions.ts`: `Transaction` ganha `recurrenceId: string | null`; novo tipo `Recurrence`.
- `lib/recurrence.ts`: `recurrenceDate(month, day)`, `nextDueAfter(date, day)` e `ensureRecurrences()`.
- Testes em `lib/recurrence.test.ts`: dia 31 em abril, fevereiro normal e bissexto, virada de ano, dia 31 voltando ao 31 depois de fevereiro, data inicial no passado gerando os meses entre ela e hoje, série já em dia não gerando nada.
- Sem mudança visível na interface nesta fase.

## Fase 16 — Interface

### Formulário de criação

- Abaixo do campo de data: caixa de seleção "Repetir todo mês", desmarcada por padrão.
- Marcada, mostra abaixo o texto de ajuda `recurrence.help(dia)` (ver Copy).
- Só na criação. O formulário de **edição** de uma movimentação não tem essa opção.
- Salvar com a caixa marcada chama `create_recurrence` por uma Server Action com validação Zod (mesmo schema da movimentação + `repeat`). O toast usa `recurrence.toastTitle` e `recurrence.toastBody` (ou `toastBodyBackfill`, quando a data inicial no passado gerou mais de um lançamento).

### Marca nas linhas

- Movimentação com `recurrenceId` mostra a etiqueta mono `MENSAL` ao lado da descrição, no mesmo estilo da `CategoryTag` (desktop: na célula de descrição; mobile: no metadado da linha, depois da categoria, separada por `·`).
- No detalhe da movimentação (mobile) e no formulário de edição, uma linha de texto `recurrence.fromSeries` com link "Gerenciar" para `/configuracoes#config-recorrencias`.
- No formulário de edição de uma ocorrência, o controle de tipo (`TypeSegmented`) não aparece; o tipo fica só na etiqueta, como no formulário de criação.

### Configurações: seção Recorrências

- Nova seção entre Categorias e Perfil, com índice `02`. As seguintes passam a `03` (Perfil), `04` (Senha), `05` (Aparência).
- Lista das séries ativas, com despesas primeiro e depois receitas, cada grupo ordenado pelo dia:
  - descrição, etiqueta de tipo (`TypeTag`), categoria, valor com sinal, `recurrence.dayLabel(dia)`;
  - ações "Editar" e "Encerrar", no mesmo padrão das categorias (botões `quiet`, alvo de 44px no mobile).
- **Editar** abre o diálogo com descrição, valor e categoria preenchidos, mais o aviso `recurrence.editNote`. Salvar mostra toast `recurrence.toastUpdated`.
- **Encerrar** abre confirmação no padrão do `DeleteDialog`, com botão perigo `recurrence.endConfirm`. Encerrar mostra toast `recurrence.toastEnded`.
- Lista vazia: texto `recurrence.empty`.

### Movimento

Reaproveita o da V5: linha nova com entrada de 16px e destaque (a primeira ocorrência), linha da lista de séries recolhendo ao encerrar. Nada novo.

## Copy (adicionar a `04-copy.md` e `lib/copy.ts`, grupo `recurrence`)

| Chave | Texto |
|---|---|
| recurrence.repeat | Repetir todo mês |
| recurrence.help(dia) | Lançada todo dia {dia}. Em meses mais curtos, no último dia. |
| recurrence.tag | MENSAL |
| recurrence.fromSeries | Faz parte de uma recorrência mensal. |
| recurrence.manage | Gerenciar |
| recurrence.title | Recorrências. |
| recurrence.dayLabel(dia) | TODO DIA {dia} |
| recurrence.empty | Nenhuma recorrência ativa. Marque "Repetir todo mês" ao adicionar uma receita ou despesa. |
| recurrence.edit | Editar |
| recurrence.editTitle | Editar recorrência. |
| recurrence.editNote | Vale para os próximos lançamentos. Os já feitos não mudam. |
| recurrence.save | Salvar recorrência |
| recurrence.end | Encerrar |
| recurrence.endTitle | Encerrar recorrência? |
| recurrence.endBody(descrição) | {descrição} para de ser lançada. As movimentações já feitas continuam no histórico. |
| recurrence.endConfirm | Encerrar recorrência |
| recurrence.ending | Encerrando… |
| recurrence.toastTitle | RECORRÊNCIA CRIADA |
| recurrence.toastBody(dia) | Lançada todo dia {dia}. |
| recurrence.toastBodyBackfill(dia, n) | Lançada todo dia {dia}. {n} lançamentos até hoje. |
| recurrence.toastUpdated | RECORRÊNCIA ATUALIZADA |
| recurrence.toastEnded | RECORRÊNCIA ENCERRADA |
| recurrence.errorDateOld | A data inicial pode ser de até 12 meses atrás. |

Os demais erros de validação reusam os de `tx`; erro de servidor reusa `tx.errorServer`.

## Critérios de aceite (além de `07-criterios-de-aceite.md`)

**Fase 15**
- [ ] Chamar `materialize_recurrences()` duas vezes seguidas (ou em paralelo) não duplica nenhuma movimentação.
- [ ] Série criada em 31/01 lança 28/02 (29/02 em ano bissexto), 31/03 e 30/04.
- [ ] Excluir uma ocorrência e reabrir o app não a recria.
- [ ] Série encerrada não lança mais nada.
- [ ] Um usuário não vê, não gera e não altera séries de outro (conferido com dois usuários).
- [ ] Inserir em `transactions` com `recurrence_id` pelo cliente falha com erro de permissão; inserir e atualizar `next_due_on` em `recurrences` pelo cliente também.
- [ ] As RPCs falham sem sessão (`anon`) e nunca tocam linhas de outro usuário.
- [ ] Criar movimentação avulsa continua funcionando depois da troca para insert por coluna.
- [ ] Testes de `lib/recurrence.ts` verdes e coerentes com `recurrence_date` no banco.

**Fase 16**
- [ ] Criar com "Repetir todo mês" lança a primeira ocorrência, com destaque e toast; data no passado lança também os meses até hoje.
- [ ] Etiqueta `MENSAL` nas ocorrências, na tabela e na lista mobile.
- [ ] Editar a série muda só os lançamentos seguintes; encerrar mantém o histórico.
- [ ] Editar ou excluir uma ocorrência não afeta a série; a edição de uma ocorrência não oferece troca de tipo.
- [ ] Data inicial com mais de 12 meses mostra `recurrence.errorDateOld`.
- [ ] Índices de Configurações renumerados; sem rolagem horizontal em 360px.
- [ ] `tsc`, `lint` e testes verdes; screenshots em 1440px e 390px, claro e escuro, das telas alteradas anexados ao PR.

## Fora desta versão

Frequências além de mensal, data de término, parcelamento, previsão em meses futuros, reativar série encerrada, notificação de lançamento, alterar tipo ou dia de uma série.
