# Prompt inicial para o Claude Code

Cole o texto abaixo na primeira sessão, com a pasta `handoff/` e o `CLAUDE.md` já no repositório.

---

Você vai implementar o MVP do "Saldo.", uma aplicação web de finanças pessoais para um projeto acadêmico, com Next.js (App Router), TypeScript, Supabase e Tailwind v4.

Todo o design, as regras de negócio, os textos, o schema do banco e o plano de trabalho estão na pasta `handoff/`. O `CLAUDE.md` na raiz resume as regras.

Antes de escrever código:
1. Leia `handoff/README.md` e todos os arquivos de `handoff/docs/`.
2. Veja os prints em `handoff/design/prints/` (são 36 telas: desktop 1440px e mobile 390px).
3. Me responda com: (a) um resumo de uma linha por fase do plano; (b) qualquer inconsistência ou ambiguidade que você encontrou nos documentos; (c) as perguntas que precisa que eu responda antes da Fase 0.

Não comece a implementar até eu confirmar. Depois, execute uma fase por vez, e ao fim de cada fase liste o que foi feito, como testar e as diferenças que ainda existem em relação aos prints.

---

## Prompts úteis durante o desenvolvimento

- *"Execute a Fase N do plano. Ao final, compare cada tela com os prints listados na fase."*
- *"Abra `handoff/design/html/<id>.html` e ajuste o componente X para bater com as medidas exatas."*
- *"Revise a implementação contra `handoff/docs/07-criterios-de-aceite.md` e liste o que falha."*
- *"Teste o isolamento de dados: com dois usuários, tente ler e apagar movimentações do outro."*
