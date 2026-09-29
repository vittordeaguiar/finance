# 12 — V5: movimento e símbolos

**Implementar só depois da Fase 13 (V4 mergeada).** Uma fase:

- **Fase 14 — Movimento**: animações mais evidentes, com duração curta, e dois símbolos novos.

Não há prints. A identidade não muda: nenhuma cor, fonte, sombra ou raio novo. O que muda é **quanto** as peças se movem, **em que ordem** entram e **o contraste** de cor durante a transição.

## Por que

A interface está correta, mas estática: o resumo aparece pronto, uma linha nova só se distingue pelo toast e a troca de mês quase não se percebe. O objetivo é deixar cada mudança de estado visível, sem transformar o app em algo decorativo.

## Regras

1. **Teto de 300ms** por animação (duração, não atraso). A única exceção é a pulsação do skeleton, que é contínuo enquanto carrega.
2. **Só `transform`, `opacity` e cor.** Nada de animar `width`, `top` ou sombra (60fps no celular). A exceção é recolher a altura da linha excluída, que já existia.
3. **Sem bounce elástico, rotação, blur ou escala acima de 1.** O único passar do ponto permitido é o do sheet mobile (1–2px).
4. **Escalonamento só no primeiro carregamento** da aba. Revalidações, troca de mês e ações do usuário não repetem a entrada.
5. **`prefers-reduced-motion`**: tudo vira troca instantânea; a contagem mostra o valor final direto.
6. Dinheiro continua em centavos inteiros durante a contagem: cada quadro é arredondado antes de formatar.

## Tokens

| Token | Valor | Uso |
|---|---|---|
| `--duration-instant` | 120ms | troca de cor, hover |
| `--duration-fast` | 180ms | modal desktop, itens escalonados |
| `--duration-base` | 240ms | troca de mês, régua da aba, revelação do saldo |
| `--duration-slow` | 300ms | contagem, linha nova, exclusão, barras do relatório |
| `--stagger` | 30ms | intervalo entre itens escalonados |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | cor, saídas |
| `--ease-emphasized` | `cubic-bezier(0.16, 1, 0.3, 1)` | entradas |

## Tabela de movimento

| Elemento | Gatilho | Duração | Curva | Efeito |
|---|---|---|---|---|
| Valores do resumo | carregar e mudar | 300ms | emphasized | contam do valor anterior (0 na primeira vez) ao novo |
| Saldo | primeiro carregamento | 240ms | emphasized | sobe de uma máscara (`translateY(100%)` → 0) |
| Seções da aba | primeiro carregamento | 180ms cada, +30ms entre elas | emphasized | fade + 16px de baixo, no máximo 6 peças |
| Linha nova | salvar | 300ms | emphasized | fade + 16px; o fundo semântico acende e se apaga |
| Linha excluída | excluir | 300ms | standard | desliza 24px para a direita e recolhe a altura |
| Troca de mês | stepper | 240ms | emphasized | conteúdo entra de 24px na direção da navegação |
| Sheet mobile | abrir | 260ms | emphasized | sobe de baixo, passa 2px do ponto (quadro em 80%) e assenta |
| Modal desktop | abrir | 180ms | emphasized | fade + 8px (sem mudança) |
| Botão primário | pressionar | 180ms | emphasized | faixa `accent-hover` preenche da esquerda (sem escalar o botão) |
| Setas `→` e `›` | hover | 120ms | standard | deslocam 2px para a direita |
| Régua da aba ativa | trocar de aba | 240ms | emphasized | desliza até a nova aba |
| Toast | aparecer | 240ms | emphasized | sobe 24px; a régua verde do topo se desenha da esquerda |
| Barras do relatório | carregar e trocar de mês | 300ms, +30ms entre elas | emphasized | crescem da esquerda |
| Skeleton | carregando | 1,2s em loop, ida e volta | standard | opacidade 1 → 0,5 (sem gradiente) |
| Foco | teclado | 120ms | standard | contorno 2px `accent`, 2px de offset |

## Símbolos novos

Somam-se aos do `02-design-system.md`, cada um com uma função só, sempre `aria-hidden` (o texto do botão ou do toast já diz o que é):

- `↻` tentar novamente (antes do texto do botão).
- `✓` confirmação no título dos toasts de sucesso.

## Critérios de aceite (Fase 14)

- [ ] Nenhuma animação passa de 300ms, exceto o skeleton.
- [ ] Com `prefers-reduced-motion: reduce`, nada se move e os valores aparecem finais.
- [ ] A entrada escalonada não se repete ao criar, editar, excluir ou trocar de mês.
- [ ] Nenhuma cor, sombra ou raio novo; tokens só em `tokens.css` e `lib/motion.ts`.
- [ ] `tsc`, `lint` e testes verdes; claro e escuro conferidos em 1440px e 390px.
