@AGENTS.md

# CLAUDE.md — Saldo.

Aplicação web de finanças pessoais (projeto acadêmico). Next.js App Router + TypeScript strict + Supabase + Tailwind v4.

## Fonte da verdade
Todo o design e as regras estão em `handoff/`. Leia `handoff/README.md` antes de qualquer tarefa e o documento específico da área que for tocar:
- produto e escopo: `handoff/docs/01-produto.md`
- visual: `handoff/docs/02-design-system.md` + `handoff/design/tokens.css`
- telas e estados: `handoff/docs/03-telas-e-estados.md` + `handoff/design/prints/` + `handoff/design/html/`
- textos: `handoff/docs/04-copy.md`
- dados e backend: `handoff/docs/05-dados-e-backend.md` + `handoff/supabase/migrations/`
- componentes: `handoff/docs/06-componentes.md`
- pronto = `handoff/docs/07-criterios-de-aceite.md`

Os arquivos em `handoff/design/source/*.dc.html` são fontes do canvas de design (formato próprio). Não os use como código; use `handoff/design/html/` para inspecionar medidas.

## Regras
- Não adicionar funcionalidades fora de `01-produto.md`. Na dúvida, pergunte.
- Não inventar cores, fontes, sombras ou raios. Só tokens de `tokens.css`.
- Textos exatamente como em `04-copy.md`, centralizados em `lib/copy.ts`. Interface 100% pt-BR.
- Sem emoji em UI, código ou commits. Ícones só os caracteres unicode definidos no design system.
- Dinheiro sempre em centavos inteiros (`bigint` no banco, `number` inteiro no TS). Nunca float.
- Server Components por padrão; `'use client'` só quando necessário. Escrita apenas por Server Actions com validação Zod.
- Segurança por RLS; nunca usar `service_role` no app.
- Sem `any`. Rodar `tsc --noEmit` e `lint` antes de concluir uma tarefa.
- Ao terminar uma tela, compare com o print correspondente em 1440px e 390px e liste diferenças restantes.
- Trabalhe por fases (`08-plano-de-implementacao.md`). Não pule fases.
- Texto do print divergente de `04-copy.md`: vale o copy.

## Git
- Commitar ao fim de cada fase (e em pontos estáveis dentro dela), só com `typecheck`, `lint` e `test` verdes.
- Mensagens em pt-BR no formato `tipo(escopo): resumo` (ex.: `feat(fase-2): tela de login`).
- **NUNCA** incluir `Co-Authored-By`, "Generated with Claude Code" ou qualquer atribuição de IA em commits ou PRs. Um hook (`.claude/hooks/block-commit-attribution.sh`) e o `commit-msg` do git bloqueiam isso.
- Não dar push sem pedido explícito.
- PRs sempre abertos como **Ready for review** (nunca draft): o review automático do Codex só roda em PR pronto para review.
