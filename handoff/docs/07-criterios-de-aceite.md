# 07 — Critérios de aceite

Uma tela só está pronta quando todos os itens aplicáveis passam.

## Visual
- [ ] Comparada lado a lado com `design/prints/<id>.png` em 1440px e 390px: mesma hierarquia, cores, fontes, espaçamentos (tolerância de poucos px).
- [ ] Nenhuma cor fora de `tokens.css`; nenhum `#fff`/`#000`; sem sombras além de modal/sheet/toast; sem cantos arredondados além de 2px.
- [ ] Space Grotesk e IBM Plex Mono carregadas via `next/font`.
- [ ] Todos os valores com `tabular-nums` e o sinal correto (`+`, `−` U+2212).
- [ ] Sem emoji. Ícones apenas unicode listados.

## Funcional
- [ ] Cadastro cria usuário e perfil com nome; login e logout funcionam; rotas protegidas redirecionam.
- [ ] Recuperação de senha: pedir link, receber, definir nova senha, entrar; link expirado mostra a etapa correta.
- [ ] Criar receita e despesa com descrição, valor e data; saldo, totais e contagens atualizam sem recarregar a página.
- [ ] Histórico ordenado por `occurred_at desc, created_at desc`; lançamento retroativo aparece na posição certa.
- [ ] Excluir pede confirmação, mostra o saldo antes/depois correto e atualiza tudo.
- [ ] Saldo negativo exibe a etiqueta e a frase com a diferença correta.
- [ ] Usuário A nunca vê nem apaga dados do usuário B (testar com duas contas e tentando apagar um id alheio).

## Estados
- [ ] Vazio, carregando, erro ao carregar, negativo, sucesso ao salvar, após excluir.
- [ ] Modal: erro de validação por campo, salvando (tudo desabilitado), erro do servidor preservando o que foi digitado.
- [ ] Login: erro genérico e "Entrando…". Cadastro: erros por campo.

## Acessibilidade e mobile
- [ ] Navegação completa por teclado; foco visível; foco preso e devolvido nos modais; Esc fecha.
- [ ] Labels, `aria-invalid`, `aria-describedby`, `role="alert"` / `role="status"` conforme `03-telas-e-estados.md`.
- [ ] Alvos de toque ≥ 44px; inputs mobile com fonte ≥ 16px; `inputmode="decimal"` no valor; barra inferior respeita `env(safe-area-inset-bottom)`.
- [ ] Sem rolagem horizontal em 360px.

## Código
- [ ] `tsc --noEmit` e `eslint` sem erros.
- [ ] Nenhum `any`; dinheiro sempre em centavos inteiros.
- [ ] Nenhuma chave de serviço (`service_role`) no cliente ou no repositório.
