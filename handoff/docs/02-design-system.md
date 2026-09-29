# 02 — Design system aplicado

Base: **Design System Burm**, território único `green-deep`. Não inventar cores, fontes ou estilos fora deste documento. Tokens prontos em `design/tokens.css`; tokens originais em `design/tokens.burm.json`.

## Princípio central

O preto é a massa estrutural e o verde é acento — nunca o contrário. Fundo claro (bone), blocos pretos ("slabs") para o que é mais importante (resumo financeiro, painel de marca no login), verde só em detalhes.

## Cores

| Uso | Token | Hex |
|---|---|---|
| Fundo da página | `background` / bone-100 | `#f3efe5` |
| Superfície (cards, tabela, inputs, modais) | `surface` / bone-50 | `#fffaf0` |
| Texto primário e botão primário | `text` | `#17201b` |
| Texto secundário, labels | `text-secondary` / ink-500 | `#526058` |
| Borda padrão | `border` / bone-400 | `#d2cabb` |
| Divisória entre linhas | `border-subtle` | `#e0d9cb` |
| Borda do botão secundário | `border-strong` / ink-400 | `#69746d` |
| Acento (eyebrow, índice, link, foco, marca) | `accent` / green-700 | `#183f32` |
| Slab (bloco preto) | ink-900 | `#111815` |
| Texto no slab | bone-100 | `#f3efe5` |
| Texto secundário no slab | — | `#abb5ae` |
| Divisória no slab | — | `#2a352e` |
| Acento no slab | green-300 | `#8ab39e` |
| Skeleton sobre claro / sobre slab | bone-200 / ink-700 | `#e8e1d3` / `#222d27` |
| Receita (texto / fundo) | semantic-success | `#2f6b4f` / `#e8f2ec` |
| Receita sobre slab | green-200 | `#a1c5b3` |
| Despesa e erro (texto / fundo) | semantic-error | `#b42318` / `#f8e8e6` |
| Despesa sobre slab / saldo negativo | — | `#f0b4ad` |
| Informação (aviso neutro) | semantic-info | `#3f624f` / `#e7eee8` |
| Overlay de modal | text a 40% | `rgba(23,32,27,0.4)` |

Nunca usar `#fff` puro nem `#000` puro.

**V4:** a paleta escura (Fase 13) e os tokens semânticos novos (`on-primary`, `surface-hover`, `accent-hover`, `primary-pending`, `text-body`) estão definidos em `11-v4-navegacao-e-configuracoes.md`. Desde a Fase 13 estão em `tokens.css` (`:root[data-theme="dark"]` e `prefers-color-scheme`), escolhidos em Configurações > Aparência. A navegação da V4 (barra lateral e barra inferior) também está descrita lá.

## Tipografia

- **Space Grotesk** (400/500/600/700): tudo.
- **IBM Plex Mono** (400/500/600): labels de campo, eyebrows, cabeçalhos de tabela, datas, metadados, email no header. Sempre em CAIXA ALTA com tracking `0.08em` (exceto email e datas desktop, que ficam em caixa normal).
- Carregar com `next/font/google`, variáveis `--font-space-grotesk` e `--font-ibm-plex-mono`, `subsets: ['latin']`.

| Estilo | Desktop | Mobile | Peso | Tracking |
|---|---|---|---|---|
| Display (painel de marca do login) | 72px / 1.02 | 36–40px | 600 | −0.045em |
| H1 de página ("Suas finanças.") | 44px | — | 600 | −0.03em |
| Título de formulário ("Entrar na conta.") | 40px | 26px | 600 | −0.03em |
| Título de modal | 32px | 28px | 600 | −0.03em |
| H2 de seção ("Histórico…") | 24px | 20px | 600 | −0.03em |
| Saldo atual | 56px / 1 | 40px / 1 | 600 | −0.045em |
| Totais (receitas/despesas) | 32px | 19px | 600 | −0.03em / −0.02em |
| Valor na linha do histórico | 17px | 17px | 600 | — |
| Corpo | 16px / 1.5 | 15–17px | 400 | — |
| Label mono | 12px | 11px | 400–500 | 0.08em |
| Caption mono | 11px | 10–11px | 400 | 0.06–0.08em |

Todo valor monetário usa `font-variant-numeric: tabular-nums`.

## Convenções de texto da marca

- Títulos curtos terminam com ponto: "Suas finanças.", "Criar conta.", "Adicionar receita."
- Frases em sentence case. CAIXA ALTA só em labels mono.
- Índices de seção em mono verde com dois dígitos: `01 · VISÃO GERAL`, `02 Histórico`.
- Separador é o ponto médio `·`. Travessão `—` para qualificações.
- Sem emoji. Ícones são caracteres unicode: `↗` receita, `↘` despesa, `→` avançar, `←` voltar, `×` fechar, `›` abrir detalhe, `↓` apontar para baixo. V5: `↻` tentar novamente, `✓` confirmação no toast de sucesso (ver `12-v5-movimento.md`).
- Sinal de menos é o caractere `−` (U+2212), não hífen.

## Espaçamento e layout

- Desktop: largura útil com padding lateral de 64px; seções separadas por 40px; header de 64px.
- Mobile (base 390px): padding lateral de 20px; header de 56px; barra inferior fixa de 96px (inclui área segura).
- Escala: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.

## Forma e superfície

- Canto reto por padrão. `2px` só em botões, inputs e etiquetas.
- Separação por borda de 1px e espaço, não por sombra.
- Única sombra: modal/bottom sheet e toast (`0 24px 64px rgba(23,32,27,.2)`).
- Sem gradientes, sem fotos, sem ilustrações.
- Alertas usam régua de 3px à esquerda na cor semântica (é a única exceção à regra de "sem borda colorida").

## Componentes base (medidas)

| Componente | Desktop | Mobile |
|---|---|---|
| Botão primário | 48–52px alt., fundo `#17201b`, texto bone-50, 600 | 56px, largura total |
| Botão secundário | 48px, fundo surface, borda `#69746d` | 52–56px |
| Botão perigo | fundo `#b42318`, texto bone-50 | idem |
| Botão perigo outline | borda e texto `#b42318` | idem |
| Botão em progresso | fundo `#526058` (perigo: `#8a4a44`, token `danger-pending`), label "…ndo…", `disabled`, `aria-busy` | idem |
| Input | 48px, surface, borda `#d2cabb` | 52px, fonte 17px (evita zoom no iOS) |
| Input com erro | borda `#b42318` + mensagem 13px vermelha abaixo | idem |
| Campo de valor | prefixo `+ R$`/`− R$` em bloco com fundo semântico + input 24px 600 tabular | 60px de altura, 26px |
| Etiqueta de tipo | 26–28px alt., mono 11–12px, fundo semântico, texto semântico, `↗ RECEITA`/`↘ DESPESA` | idem |
| Alerta | régua 3px esquerda, fundo semântico, label mono + texto | idem |
| Toast | slab, label mono verde + texto, botão fechar 44px, acima da barra inferior | — |

Área mínima de toque no mobile: 44×44px.

## Movimento

- Cor: 120ms `cubic-bezier(0.2, 0, 0, 1)`.
- Modal/sheet: entrada 180ms `cubic-bezier(0.16, 1, 0.3, 1)`; sheet sobe de baixo, modal faz fade + 8px. V5: o sheet usa 260ms e passa 2px do ponto antes de assentar.
- Hover de botão: troca de cor (primário vira `#183f32`). Sem escala, sem bounce.
- V5 (Fase 14): teto de 300ms por animação, entrada escalonada no primeiro carregamento, contagem de valores, régua de aba deslizante e demais efeitos na tabela de `12-v5-movimento.md`.
- `prefers-reduced-motion` desliga tudo.
