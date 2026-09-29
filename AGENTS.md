<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Saldo. — instruções do projeto

Aplicação web de finanças pessoais (projeto acadêmico): Next.js App Router, TypeScript strict, Supabase e Tailwind v4.

## Fonte da verdade

- Antes de qualquer tarefa, leia `handoff/README.md` e o documento da área que será alterada.
- Produto e escopo: `handoff/docs/01-produto.md`.
- Visual: `handoff/docs/02-design-system.md` e `handoff/design/tokens.css`.
- Telas e estados: `handoff/docs/03-telas-e-estados.md`, `handoff/design/prints/` e `handoff/design/html/`.
- Textos: `handoff/docs/04-copy.md`.
- Dados e backend: `handoff/docs/05-dados-e-backend.md` e `handoff/supabase/migrations/`.
- Componentes: `handoff/docs/06-componentes.md`.
- Critérios de aceite: `handoff/docs/07-criterios-de-aceite.md`.
- Plano e sequência de fases: `handoff/docs/08-plano-de-implementacao.md`.
- Os arquivos `handoff/design/source/*.dc.html` são fontes do canvas, em formato próprio. Não os use como código; consulte `handoff/design/html/` para medidas.

## Produto e implementação

- Não adicione funcionalidades fora de `handoff/docs/01-produto.md`. Se surgir uma necessidade fora do escopo, pare e pergunte.
- Não invente cores, fontes, sombras ou raios; use somente os tokens de `handoff/design/tokens.css`.
- Use os textos de `handoff/docs/04-copy.md`, centralizados em `lib/copy.ts`. A interface deve ser 100% pt-BR.
- Não use emoji na interface, no código ou em commits. Use apenas os caracteres Unicode definidos no design system como ícones.
- Represente dinheiro em centavos inteiros: `bigint` no banco e `number` inteiro no TypeScript. Nunca use ponto flutuante para valores monetários.
- Prefira Server Components. Use `'use client'` somente quando necessário. Faça escritas por Server Actions com validação Zod.
- Garanta a segurança com RLS. Nunca use `service_role` no app.
- Não use `any`.
- Siga as fases de `handoff/docs/08-plano-de-implementacao.md`; não pule fases.
- Ao concluir uma tela, compare-a com os prints correspondentes em 1440px e 390px e registre as diferenças restantes.
- Quando o texto de um print divergir de `handoff/docs/04-copy.md`, siga o documento de copy.

## Git e entrega

- Faça commits ao fim de cada fase e em pontos estáveis dentro dela, somente com typecheck, lint e testes aprovados.
- Escreva mensagens de commit em pt-BR no formato `tipo(escopo): resumo`, por exemplo `feat(fase-2): tela de login`.
- Não inclua `Co-Authored-By`, “Generated with Claude Code” nem qualquer atribuição de IA em commits ou PRs.
- Não faça push sem pedido explícito.
- Abra PRs como Ready for review, nunca como draft.
