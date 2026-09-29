# Saldo. — pacote de handoff para implementação

Aplicação web de controle de finanças pessoais (projeto acadêmico). Este pacote contém tudo o que foi decidido no design para que o Claude Code (ou qualquer dev) implemente o MVP sem precisar reabrir o canvas.

## Como usar com o Claude Code

1. Crie o repositório do projeto (vazio ou já com `create-next-app`).
2. Copie esta pasta inteira para dentro do repositório como `handoff/`.
3. Copie `CLAUDE.md` para a raiz do repositório (é lido automaticamente pelo Claude Code a cada sessão).
4. Abra o Claude Code na raiz e cole o conteúdo de `PROMPT-INICIAL.md`.
5. Siga as fases de `docs/08-plano-de-implementacao.md`: uma fase por vez, revisando antes de avançar.

## Mapa do pacote

| Caminho | O que é |
|---|---|
| `CLAUDE.md` | Regras permanentes do projeto para o Claude Code |
| `PROMPT-INICIAL.md` | Prompt para iniciar a implementação |
| `docs/01-produto.md` | Contexto, requisitos, escopo e fora de escopo |
| `docs/02-design-system.md` | Identidade Burm aplicada: cores, tipografia, espaçamento, regras |
| `docs/03-telas-e-estados.md` | Todas as 36 telas do MVP, com print, conteúdo, estados e comportamento |
| `docs/04-copy.md` | Todos os textos da interface (pt-BR) |
| `docs/05-dados-e-backend.md` | Schema, RLS, Server Actions, validação, formatação de dinheiro |
| `docs/06-componentes.md` | Árvore de componentes, props e estrutura de pastas |
| `docs/07-criterios-de-aceite.md` | Checklist para dar cada tela como pronta |
| `docs/08-plano-de-implementacao.md` | Fases de implementação e prompts por fase |
| `docs/09-v2-filtro-e-edicao.md` | V2 (pós-MVP): filtro por mês e edição — telas 40 a 51 |
| `docs/10-v3-categorias-e-relatorio.md` | V3 (pós-V2): categorias e relatório de gastos por categoria — Fases 8 e 9, sem prints |
| `docs/11-v4-navegacao-e-configuracoes.md` | V4 (pós-V3): navegação por abas, nova Início, configurações e tema escuro — Fases 10 a 13, sem prints |
| `docs/12-v5-movimento.md` | V5 (pós-V4): movimento e símbolos — Fase 14, sem prints |
| `docs/13-v6-recorrencias.md` | V6 (pós-V5): movimentações recorrentes mensais — Fases 15 e 16, sem prints |
| `docs/14-v7-relatorios.md` | V7 (pós-V6): resumo do mês e receitas por categoria em Relatórios — Fase 17, sem prints |
| `docs/15-v8-desfazer-e-busca.md` | V8 (pós-V7): desfazer exclusão e busca por descrição em Movimentações — Fases 18 a 20, sem prints |
| `design/prints/` | PNG de cada tela (mobile em 2x) |
| `design/html/` | HTML estático de cada tela — fonte da verdade para medidas e estilos |
| `design/source/` | Fontes originais do canvas (`.dc.html`) e `canvas.json` |
| `design/tokens.css` | Tokens em CSS custom properties + tema Tailwind v4 |
| `design/tokens.burm.json` | Tokens originais do Design System Burm |
| `supabase/migrations/0001_init.sql` | Migração inicial: tabela, índices, RLS, view de resumo |
| `supabase/migrations/0002_grants.sql` | Permissões da Data API para `authenticated` (adicionada na implementação; sem ela a leitura falha) |

## Ordem de prioridade quando houver conflito

1. `docs/05-dados-e-backend.md` e `docs/01-produto.md` (regras de negócio)
2. `design/html/*.html` (medidas e estilos exatos)
3. `design/prints/*.png` (referência visual)
4. `docs/03-telas-e-estados.md` (intenção e comportamento)

Os valores numéricos das telas (R$ 4.406,55 etc.) são dados de exemplo. Na aplicação real, tudo vem do banco.
