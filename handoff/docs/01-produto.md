# 01 — Produto

## O que é

**Saldo.** é uma aplicação web de controle de finanças pessoais, desenvolvida como projeto acadêmico. O usuário registra o que entra (receitas) e o que sai (despesas) e vê o saldo resultante. "Saldo." é um nome provisório.

## Stack obrigatória

- Next.js (App Router), TypeScript em modo `strict`
- Supabase (Auth + PostgreSQL)
- Server Components para leitura, Client Components apenas onde há interação, Server Actions para escrita
- Tailwind CSS v4 (recomendado) com os tokens de `design/tokens.css`

## Requisitos funcionais (do enunciado)

1. Exibir saldo atual.
2. Exibir total de receitas.
3. Exibir total de despesas.
4. Cadastrar movimentações com descrição, valor e classificação (tipo: receita ou despesa).
5. Mostrar histórico cronológico das transações.
6. Diferenciar visualmente receitas e despesas — sem depender só de cor.

## Requisitos adicionados no design (decididos)

| # | Requisito | Motivo |
|---|---|---|
| A1 | Cadastro de conta, login e logout | Dados são por usuário |
| A2 | Campo **data** na movimentação (`occurred_at`), padrão = hoje, sem datas futuras | Histórico cronológico correto para lançamentos retroativos |
| A3 | Estado de **saldo negativo** explícito | É o número mais importante do produto |
| A4 | **Excluir movimentação**, com confirmação (V8: sem confirmação, com "Desfazer") | Sem isso, um erro de digitação é permanente |
| A5 | **Recuperação de senha** via Supabase Auth | Único fluxo de conta que faltava |
| A6 | Estados de carregando, vazio, erro e sucesso | Qualidade mínima de produto |

## Fora de escopo (não implementar)

Gráficos, filtros avançados, metas, orçamento mensal, múltiplas contas, notificações, gamificação, telas administrativas. **Edição** de movimentação e filtro por mês foram desenhados como V2 (`09-v2-filtro-e-edicao.md`); **categorias** e o **relatório de gastos por categoria** como V3 (`10-v3-categorias-e-relatorio.md`); **navegação por abas, tela de configurações e tema escuro** como V4 (`11-v4-navegacao-e-configuracoes.md`). **Movimentações recorrentes mensais** como V6 (`13-v6-recorrencias.md`). **Resumo do mês e receitas por categoria em Relatórios** como V7 (`14-v7-relatorios.md`). **Desfazer exclusão e busca por descrição** como V8 (`15-v8-desfazer-e-busca.md`). Todos só depois do MVP, e o que não estiver nesses documentos continua fora de escopo.

Se surgir necessidade de algo desta lista, pare e pergunte.

## Decisões de UX importantes

- **Dois CTAs separados** ("Adicionar receita" / "Adicionar despesa") em vez de um "Nova movimentação": cada modal já abre com o tipo fixo.
- **Tipo fixo no modal**: o usuário não escolhe tipo dentro do formulário; ele é indicado por etiqueta, prefixo `+ R$` / `− R$` e título.
- **Mobile**: modais viram bottom sheet; ações de criar ficam numa barra fixa inferior; tocar numa linha do histórico abre o detalhe, onde fica "Excluir".
- **Desktop**: modal centralizado; botão "Excluir" discreto no fim de cada linha.
- **Diferenciação receita/despesa**: sinal (`+`/`−`), seta (`↗`/`↘`), etiqueta com texto (RECEITA/DESPESA) e cor. Nunca só cor.
- **Mensagens de autenticação genéricas** onde revelariam existência de conta (login inválido, recuperação de senha).
