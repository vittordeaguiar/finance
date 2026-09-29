# 08 — Plano de implementação

Uma fase por sessão (ou por PR). Ao fim de cada fase: rodar `tsc`, `lint`, abrir no navegador em 1440px e 390px e comparar com os prints listados. Só avance depois de revisar.

## Fase 0 — Setup
- `create-next-app` (TypeScript, App Router, Tailwind, ESLint, `src/` opcional).
- Instalar `@supabase/supabase-js`, `@supabase/ssr`, `zod`.
- `next/font`: Space Grotesk e IBM Plex Mono com as variáveis de `tokens.css`.
- `globals.css` com Tailwind + `handoff/design/tokens.css`.
- `.env.local.example` com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (ou publishable key).
- Aplicar `supabase/migrations/0001_init.sql`.

Prompt: *"Execute a Fase 0 de handoff/docs/08-plano-de-implementacao.md. Não crie telas ainda."*

## Fase 1 — Fundamentos de UI
- `lib/money.ts`, `lib/dates.ts`, `lib/copy.ts` com testes unitários simples para parse/format de dinheiro e datas.
- Componentes `ui/` e `brand/` de `06-componentes.md`.
- Página temporária `/dev/ui` mostrando todos os componentes e variantes (remover na Fase 6).

Prints de referência: todos (para botões, inputs, etiquetas, alertas).

## Fase 2 — Autenticação
- Clientes Supabase, middleware (`middleware.ts`; no Next 16+ o arquivo se chama `proxy.ts`), `AuthShell`.
- `/login`, `/cadastro`, logout, com todos os estados.
- `/recuperar-senha`, `/auth/callback`, `/nova-senha` com as quatro etapas.

Prints: 01, 05, 05m, 18–23, 26–31.

## Fase 3 — Dashboard (leitura)
- Header, título, CTAs (ainda sem abrir nada), `SummarySlab`, `TransactionTable`, `TransactionList`, `MobileActionBar`.
- `loading.tsx`, `error.tsx`, estado vazio, estado negativo.
- Popular dados de teste via SQL para validar.

Prints: 02, 06, 09, 10, 11, 15, 16, 17, 24, 25.

## Fase 4 — Criar movimentação
- `ResponsiveDialog`, `TransactionForm`, `MoneyField`, `DateField`, `createTransaction`.
- Estados de validação, salvando, erro de servidor, toast de sucesso e destaque da linha.

Prints: 03, 04, 07, 08, 12, 13, 14.

## Fase 5 — Excluir movimentação
- Botão "Excluir" na tabela, detalhe no mobile, `DeleteDialog`, `deleteTransaction`, toast.

Prints: 32–36.

## Fase 6 — Acabamento
- Passar `07-criterios-de-aceite.md` inteiro.
- Teste de isolamento entre dois usuários.
- Remover `/dev/ui`, revisar README do repositório (como rodar, variáveis, decisões).
- Deploy (Vercel) opcional.

## Fase 7 — V2 (opcional, pós-entrega)
- Filtro por mês e edição conforme `09-v2-filtro-e-edicao.md`.

Prints: 40–51.

## Fase 8 — V3: categorias
- Migration `0004_categories.sql`, categorias padrão (novos usuários e backfill), campo CATEGORIA no formulário de criação e edição, `CategoryTag` no histórico e no detalhe, conforme `10-v3-categorias-e-relatorio.md`.

Sem prints: anexar screenshots em 1440px e 390px ao PR.

## Fase 9 — V3: relatório por categoria
- RPC `category_totals` (`0005_category_totals.sql`), seção "Para onde foi o dinheiro" entre o slab e o histórico, drill-down `?categoria=` no histórico, conforme `10-v3-categorias-e-relatorio.md`.

Depende da Fase 8. Sem prints: anexar screenshots em 1440px e 390px ao PR.

## Fase 10 — V4: navegação por abas
- Layout `app/(app)/layout.tsx` com barra lateral (desktop) e barra inferior (mobile), rotas `/movimentacoes` e `/relatorios` reusando `History`, `CategoryReport`, `getDashboardData` e `getCategoryTotals`, mês compartilhado por `?mes=`, botão "+" global, conforme `11-v4-navegacao-e-configuracoes.md`.

Depende da Fase 9. Sem prints: anexar screenshots em 1440px e 390px ao PR.

## Fase 11 — V4: nova Início
- Slab, "Maiores gastos" (top 3) e "Últimas movimentações" (5), com links para as abas, conforme `11-v4-navegacao-e-configuracoes.md`.

Depende da Fase 10.

## Fase 12 — V4: configurações
- Migration `0006_settings.sql` (policies de update/delete em `categories`, update em `profiles`, RPC `category_usage`), página `/configuracoes` com Categorias, Perfil, Senha e Sair, conforme `11-v4-navegacao-e-configuracoes.md`.

Depende da Fase 10.

## Fase 13 — V4: tema escuro
- Trocar classes de escala por tokens semânticos, paleta escura em `tokens.css`, preferência claro/escuro/sistema em cookie sem flash, seção Aparência em Configurações, conforme `11-v4-navegacao-e-configuracoes.md`.

Depende da Fase 12. Screenshots em 1440px e 390px nos dois temas.

## Fase 14 — V5: movimento
- Tokens de duração, contagem, entrada escalonada, linhas, troca de mês, sheet, botão, régua de aba, toast, barras do relatório, skeleton e símbolos `↻`/`✓`, conforme `12-v5-movimento.md`.

Depende da Fase 13.

## Fase 15 — V6: recorrências (dados)
- Migration `0007_recurrences.sql`, RPCs `materialize_recurrences` e `create_recurrence`, `lib/recurrence.ts` com testes de datas, conforme `13-v6-recorrencias.md`.

Depende da Fase 14.

## Fase 16 — V6: recorrências (interface)
- "Repetir todo mês" no formulário de criação, etiqueta `MENSAL` nas linhas, seção Recorrências em Configurações, conforme `13-v6-recorrencias.md`.

Depende da Fase 15. Screenshots em 1440px e 390px nos dois temas.

## Fase 17 — V7: resumo em Relatórios
- Resumo do mês (`SummarySlab`) no topo de Relatórios e receitas por categoria ao lado das despesas, conforme `14-v7-relatorios.md`.

Depende da Fase 16. Screenshots em 1440px e 390px nos dois temas.

## Fase 18 — V8: planejamento
- `15-v8-desfazer-e-busca.md`, copy em `04-copy.md` e escopo em `01-produto.md`.

Depende da Fase 17.

## Fase 19 — V8: desfazer exclusão
- Exclusão sem confirmação, adiada no cliente, com "Desfazer" no aviso, conforme `15-v8-desfazer-e-busca.md`.

Depende da Fase 18. Screenshots em 1440px e 390px nos dois temas.

## Fase 20 — V8: busca
- `?q=` em Movimentações, `escapeLike`, `SearchField` e estado vazio da busca, conforme `15-v8-desfazer-e-busca.md`.

Depende da Fase 19. Screenshots em 1440px e 390px nos dois temas.
