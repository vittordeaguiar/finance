# 15 — V8: desfazer exclusão e busca

**Implementar só depois da Fase 17 (V7 mergeada).** Duas fases:

- **Fase 19 — Desfazer exclusão**: a exclusão deixa de pedir confirmação e passa a oferecer "Desfazer" no aviso.
- **Fase 20 — Busca**: campo de busca por descrição em Movimentações.

Como na V3 a V7, **não há prints nem HTML**. Tudo reaproveita tokens, tipografia e componentes existentes (`Toast`, `TextField`, `MonthEmptyState`, `History`). Onde este documento não disser, siga a tela vizinha. Nada de cores, fontes, sombras, raios ou símbolos novos.

## Por que

- **Exclusão**: hoje excluir exige dois passos (Excluir, depois "Sim, excluir") e mesmo assim um toque errado é permanente. O padrão "exclui na hora, desfaz no aviso" é mais rápido e recupera o erro.
- **Busca**: para achar um lançamento ("quanto paguei de luz?") o usuário rola o mês inteiro. Com dezenas de linhas por mês, isso fica lento no celular.

## Decisões de produto (já tomadas)

### Desfazer exclusão

1. **Sem confirmação.** "Excluir" (linha no desktop, "Excluir movimentação" no detalhe mobile) remove a linha na hora e fecha o detalhe. A requisição A4 de `01-produto.md` passa a ser "excluir com desfazer".
2. **Aviso com ação.** O toast de exclusão existente (`del.toast.*`) ganha o botão "Desfazer" e fica visível por **6 s**. Saldo, slab e totais já mostram os valores sem a movimentação.
3. **Exclusão adiada no cliente.** O servidor só é chamado quando o aviso expira ou é fechado pelo ×. "Desfazer" devolve a linha no lugar e não chama o servidor. Sem migration e sem mudança em `deleteTransaction`.
4. **Uma exclusão pendente por vez.** Excluir outra linha enquanto há uma pendente confirma a anterior na hora e abre o aviso da nova.
5. **Sair antes do prazo não apaga.** Trocar de aba ou de mês confirma a exclusão pendente. Fechar ou recarregar a página antes do prazo mantém a movimentação. É o lado seguro.
6. **Falha no servidor**: a linha volta e aparece um aviso de erro (`del.toast.errorTitle` / `del.error`), sem o ✓ e com título e régua em `expense-on-slab`.
7. **Ocorrência de recorrência** segue a mesma regra: excluir uma ocorrência não afeta a série (V6).

### Busca

1. **Onde**: só em Movimentações, no topo da seção de histórico, logo abaixo do título (o lado do título já tem o chip do filtro de categoria). Aparece quando o mês tem movimentações ou há busca ativa. Início e Relatórios não mudam.
2. **O quê**: descrição, sem diferenciar maiúsculas e minúsculas, trecho em qualquer posição. Não busca por valor nem por categoria.
3. **Escopo**: o mês selecionado no stepper. A busca é um filtro da lista, como o de categoria da V3: slab e totais continuam do mês inteiro.
4. **URL**: `?q=termo`, combinável com `?mes=` e `?categoria=`. Trocar de mês mantém o `q`. Termo com espaços nas pontas é aparado, vazio equivale a sem busca e o máximo é 80 caracteres (o mesmo da descrição).
5. **Digitação**: a URL atualiza 300 ms depois da última tecla, sem entrar no histórico do navegador (`replace`). Enter aplica na hora. Um × no campo limpa a busca.
6. **Sem resultado**: estado vazio próprio dentro do histórico, com botão para limpar a busca.

## Dados

- `getDashboardData(month, limit, category, search)` em `lib/dashboard.ts`: com `search`, aplica `.ilike("description", "%termo%")` na lista e na contagem da lista, nunca no resumo.
- `%`, `_` e `\` do termo são escapados antes do `ilike` (função pura `escapeLike` em `lib/transactions.ts`, com testes). Buscar `%` encontra só descrições com `%`. `*` é removido do termo: o PostgREST o trata como curinga e não há como escapá-lo.
- `navHref` (`lib/period.ts`) aceita `q` e o preserva na troca de mês e na remoção do filtro de categoria.
- Nenhuma migration.

## Componentes

- `DeleteDialog`: sai o passo `confirm`.
- **Exclusão pendente no `MonthProvider`** (`DashboardProvider.tsx`), não no `History`: slab (`SummarySlab`), relatório (`CategoryReport`) e histórico são irmãos e leem o mesmo contexto. O provider guarda `pending: Transaction | null` e expõe `summary` e totais por categoria já descontando a pendente; o `History` só filtra a linha. Funções puras de desconto em `lib/transactions.ts` e `lib/report.ts`, com testes.
- `Toast`: `ToastData` ganha `action?: { label: string; onClick: () => void }`, `duration?: number` e `onDismiss?: (reason: "timeout" | "close" | "replaced") => void`. O provider chama `onDismiss` do aviso que sai em qualquer caso: prazo, ×, ou substituição por outro aviso. O botão de ação vem antes do ×, com o mesmo estilo de link do aviso.
- **Qualquer saída do aviso que não seja "Desfazer" confirma a exclusão**: prazo, ×, outro aviso por cima (salvar, editar, outra exclusão) e troca de mês ou aba (desmontagem do provider). Assim não existe exclusão pendente sem aviso na tela.
- `SearchField` (novo, `components/finance/`): `TextField` com rótulo visualmente oculto, `type="search"` e botão de limpar. Client component.
- `app/(app)/movimentacoes/page.tsx`: lê e valida `q` (Zod) e passa para `getDashboardData` e para o estado vazio.

## Movimento

Reaproveita o da V5: a linha sai com a animação de remoção existente e volta com a de entrada. O aviso usa a entrada e saída do toast atual. Nada novo.

## Copy (adicionar a `04-copy.md` e `lib/copy.ts`)

| Chave | Texto |
|---|---|
| del.toast.undo | Desfazer |
| del.toast.undone | Exclusão desfeita. |
| del.toast.errorTitle | EXCLUSÃO NÃO CONCLUÍDA |
| search.label | Buscar por descrição |
| search.placeholder | Buscar no mês |
| search.clear | Limpar busca |
| search.emptyTitle(termo) | Nada com "{termo}" neste mês. |
| search.emptyBody | Confira a grafia ou procure em outro mês. |

`del.detail.action` continua. `del.confirm.*` saem de `lib/copy.ts`, menos `del.confirm.submitting`, usado na exclusão de categoria. `del.toast.undone` é anunciado só para leitor de tela (`aria-live`), sem aviso visual.

## Critérios de aceite (além de `07-criterios-de-aceite.md`)

**Fase 19**
- [ ] Excluir some com a linha e atualiza saldo, slab e totais na hora, sem diálogo de confirmação.
- [ ] "Desfazer" em até 6 s devolve a linha na posição original e nada muda no banco (recarregar mostra a linha).
- [ ] Sem desfazer, recarregar depois de 6 s não mostra a linha.
- [ ] Duas exclusões seguidas: a primeira é confirmada e a segunda fica pendente.
- [ ] Salvar outra movimentação durante o prazo confirma a exclusão pendente (o aviso novo substitui o de desfazer).
- [ ] Na Início, slab e "Maiores gastos" refletem a exclusão pendente e voltam ao desfazer.
- [ ] Falha do servidor devolve a linha e mostra `del.error`.
- [ ] O botão "Desfazer" é alcançável por teclado e o aviso não rouba o foco.

**Fase 20**
- [ ] Buscar "merc" encontra "Mercado" e "supermercado" no mês selecionado.
- [ ] Buscar `%` ou `_` não retorna o mês inteiro.
- [ ] Busca somada a `categoria`, e troca de mês mantendo `q`.
- [ ] Slab e totais iguais com e sem busca.
- [ ] Sem resultado mostra o estado vazio da busca, e "Limpar busca" volta à lista completa.
- [ ] Sem rolagem horizontal em 360px.

**As duas**: `tsc`, `lint` e testes verdes; screenshots em 1440px e 390px, claro e escuro, em `docs/screenshots/fase-NN/` e no PR.

## Fora desta versão

Busca entre meses ou por período, busca por valor ou categoria, lixeira, desfazer edição, desfazer em lote.
