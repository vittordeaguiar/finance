# 03 — Telas e estados

36 telas. Cada uma tem print em `design/prints/<id>.png` e HTML estático em `design/html/<id>.html` (use o HTML para medidas exatas: abra no navegador e inspecione).

Breakpoint: **mobile < 768px** (layout 390px de referência), **desktop ≥ 768px** (referência 1440px). Entre 768 e 1100px o desktop deve continuar legível: a tabela pode esconder a coluna TIPO e manter a etiqueta junto da descrição.

## Rotas

| Rota | Tela | Acesso |
|---|---|---|
| `/login` | Login | público (logado → redireciona `/`) |
| `/cadastro` | Cadastro | público |
| `/recuperar-senha` | Esqueci a senha (pedir link / enviado) | público |
| `/nova-senha` | Definir nova senha / link expirado | sessão de recuperação |
| `/` | Dashboard | autenticado (senão → `/login`) |

Modais não são rotas no MVP (estado local). Opcional: `?novo=receita` / `?novo=despesa` para deep link.

---

## A. Autenticação

### 01 · Login (desktop) — `01-login`
Grid 2 colunas. Esquerda: slab com marca "Saldo.", eyebrow `01 · FINANÇAS PESSOAIS`, display "Seu dinheiro, **em ordem.**" (em ordem em verde-300), parágrafo, rodapé `RECEITAS · DESPESAS · SALDO`. Direita: formulário 400px centralizado — eyebrow `ACESSO`, título "Entrar na conta.", subtítulo, campos EMAIL e SENHA (com link "Esqueci minha senha" alinhado à direita do label), botão primário "Entrar →", rodapé "Ainda não tem conta? Criar conta".

Estados:
- **padrão** — `01-login`
- **erro** — `22-login-erro`: alerta no topo do form "NÃO FOI POSSÍVEL ENTRAR / Email ou senha incorretos. Confira e tente de novo."; bordas dos dois campos em vermelho. Mensagem genérica de propósito (não revelar qual campo errou).
- **entrando** — botão "Entrando…" com fundo `#526058`, campos e botão `disabled`, `aria-busy`. Print no mobile (`20`).

### 18 · Login (mobile) — `18-login-mobile`, `19-login-mobile-erro`, `20-login-mobile-entrando`
Slab no topo (marca + eyebrow + display 40px). Form abaixo com inputs 52px. Botão e link "Criar conta" ancorados no fim da tela (`margin-top: auto`).

### 05 · Cadastro (desktop) — `05-cadastro`, `23-cadastro-erro`
Mesmo layout do login. Display "Comece do **zero.**". Campos: NOME, EMAIL, SENHA (hint mono "MÍNIMO DE 8 CARACTERES"), CONFIRMAR SENHA. Botão "Criar conta →". Rodapé "Já tem conta? Entrar".

Erros por campo (mensagem 13px vermelha abaixo do campo, borda vermelha):
- email já cadastrado: "Este email já tem conta. Entrar" (link) — ver nota de segurança em `05-dados-e-backend.md`
- senha curta: "A senha tem N caracteres. Use pelo menos 8." (hint também fica vermelho)
- confirmação diferente: "As senhas não coincidem."

### 05m · Cadastro (mobile) — `05m-cadastro-mobile`, `21-cadastro-mobile-erro`
Slab compacto (marca + eyebrow CADASTRO + "Criar **conta.**" 36px). Form com os mesmos campos.

### 26–31 · Recuperação de senha
Componente único com prop `etapa`:

| Etapa | Mobile | Desktop | Conteúdo |
|---|---|---|---|
| `solicitar` | `26` | `30` | eyebrow RECUPERAR ACESSO, "Esqueceu a senha?", campo EMAIL, "Enviar link →", "← Voltar para o login" |
| `enviado` | `27` | — (mesmo layout) | eyebrow EMAIL ENVIADO, "Confira sua caixa de entrada.", texto neutro "Se existir uma conta com **email**…", alerta info "NÃO CHEGOU?", botão secundário "Reenviar email" |
| `nova` | `28` | `31` | eyebrow NOVA SENHA, "Crie uma nova senha.", NOVA SENHA (+ hint) e CONFIRMAR NOVA SENHA, "Salvar nova senha →" |
| `expirado` | `29` | — | eyebrow vermelho LINK INVÁLIDO, "Este link expirou.", explicação, "Pedir novo link →" |

Desktop usa o mesmo painel de marca do login à esquerda. Mobile usa header slab só com a marca.
Após salvar nova senha: redirecionar para `/` já autenticado.
"Reenviar email": desabilitar por 60s após envio (Supabase limita envios).

---

## B. Dashboard

### 02 · Dashboard (desktop) — `02-dashboard`
1. **Header** 64px: marca à esquerda; email (mono) + botão "Sair" à direita.
2. **Título**: eyebrow `01 · VISÃO GERAL` + H1 "Suas finanças."; à direita os CTAs "− Adicionar despesa" (secundário) e "+ Adicionar receita" (primário). Os sinais `−`/`+` são coloridos (vermelho / verde-300).
3. **Resumo (slab)**: grid `1.4fr 1fr 1fr` com divisórias verticais.
   - SALDO ATUAL: valor 56px + "Receitas menos despesas registradas."
   - `↗ TOTAL DE RECEITAS`: `+ R$ …` em `#a1c5b3` + "N entradas"
   - `↘ TOTAL DE DESPESAS`: `− R$ …` em `#f0b4ad` + "N saídas"
4. **Histórico**: `02` + "Histórico de movimentações." + à direita `MAIS RECENTES PRIMEIRO`. Tabela em surface com borda. Colunas: DATA (mono, "22 set 2026") | DESCRIÇÃO | TIPO (etiqueta) | VALOR (direita, com sinal, cor semântica) | ação "Excluir" (botão texto discreto, `aria-label="Excluir <descrição>"`).

Singular/plural: "1 entrada" / "N entradas", "1 saída" / "N saídas".

### 06 · Dashboard (mobile) — `06-dashboard-mobile`
- Header 56px: marca + "Sair" (texto, 44px de toque).
- Slab: SALDO ATUAL 40px; abaixo grid 2 colunas `↗ RECEITAS` / `↘ DESPESAS` (19px).
- Histórico: `02 Histórico.` + `MAIS RECENTES PRIMEIRO`. Lista em surface; cada linha é um `<button>` (mín. 68px) com descrição (ellipsis) + linha mono `22 SET · ↘ DESPESA` à esquerda; valor com sinal + `›` à direita. Toque abre o detalhe (tela 32).
- **Barra fixa inferior** (96px, com padding de área segura): "− Despesa" (secundário) e "+ Receita" (primário), 56px, lado a lado.
- A área do conteúdo rola por trás da barra; reservar `padding-bottom` equivalente.

### Estados do Dashboard

| Estado | Mobile | Desktop | Regra |
|---|---|---|---|
| padrão | `06` | `02` | — |
| vazio (0 movimentações) | `09` | `15` | Resumo mostra `R$ 0,00`, `+ R$ 0,00`, `− R$ 0,00`, "0 entradas/saídas". No lugar da lista: `00 MOVIMENTAÇÕES` / "Nada registrado ainda." / texto / "USE OS BOTÕES ABAIXO ↓" (mobile) ou "ACIMA ↗" (desktop). |
| carregando | `10` | `16` | Skeleton: blocos `#222d27` no slab, `#e8e1d3` nas linhas; label `CARREGANDO MOVIMENTAÇÕES…` com `aria-live="polite"`. Usar como `loading.tsx` / Suspense fallback. |
| erro ao carregar | `11` | `17` | Resumo mostra `R$ —` e "Indisponível". Alerta: `ERRO AO CARREGAR` / "Não foi possível buscar suas movimentações. Verifique a conexão e tente de novo." + botão "Tentar novamente" (`router.refresh()` ou `reset()` do error boundary). |
| saldo negativo | `24` | `25` | Valor do saldo com `−` e cor `#f0b4ad`; etiqueta `↘ SALDO NEGATIVO` (fundo `#f0b4ad`, texto `#111815`) + "As despesas superaram as receitas em R$ X." (substitui a legenda padrão no desktop). |
| sucesso ao salvar | `14` | (mesmo padrão) | Toast slab acima da barra inferior: label `RECEITA SALVA`/`DESPESA SALVA` + "+ R$ 500,00 somados ao saldo." / "− R$ X subtraídos do saldo."; a nova linha aparece destacada com fundo `#e8f2ec` (receita) ou `#f8e8e6` (despesa) por ~3s. Toast some sozinho em 5s e tem botão fechar. |
| após excluir | `35` | (mesmo padrão) | Linha removida, totais recalculados, toast `DESPESA EXCLUÍDA`/`RECEITA EXCLUÍDA` + "<descrição> · saldo agora é R$ X." |

---

## C. Criar movimentação

### 03 / 04 · Modal de receita / despesa (desktop) — `03-modal-de-receita`, `04-modal-de-despesa`
Modal 520px centralizado sobre o dashboard com overlay 40%. Estrutura:
1. Cabeçalho: eyebrow `NOVA MOVIMENTAÇÃO`, botão × (44px), título "Adicionar receita." / "Adicionar despesa.", etiqueta de tipo + "Tipo fixo · entra somando no saldo" / "Tipo fixo · sai subtraindo do saldo".
2. Corpo: DESCRIÇÃO (input), VALOR (prefixo semântico `+ R$`/`− R$` + input grande), DATA (input `type="date"`, padrão hoje, `max` = hoje, label à direita `HOJE` quando o valor é a data atual, ajuda "Preenchida com hoje. Altere para lançar algo que já aconteceu.").
3. Rodapé em fundo bone-100: "Cancelar" (secundário) + "Salvar receita"/"Salvar despesa" (primário), alinhados à direita.

### 07 / 08 · Modal mobile (bottom sheet) — `07-modal-de-receita-mobile`, `08-modal-de-despesa-mobile`
Mesmo conteúdo, ancorado embaixo, largura total, alça 40×4px no topo. Botões empilhados, largura total: primário (56px) em cima, "Cancelar" (52px) embaixo. Input de valor com `inputmode="decimal"`.

### Estados do modal

| Estado | Print | Regra |
|---|---|---|
| padrão | `07`, `08`, `03`, `04` | Foco inicial no campo DESCRIÇÃO. |
| erro de validação | `12` | Alerta no topo do corpo "Revise os campos marcados para salvar." + borda vermelha e mensagem por campo: "Informe uma descrição." / "O valor precisa ser maior que zero." / "A data não pode ser no futuro." Foco vai para o primeiro campo inválido. |
| salvando | `13` | Campos com opacidade 0.6 e `disabled`; botão "Salvando…" com fundo `#526058`, `aria-busy`; Cancelar e × desabilitados. |
| erro do servidor | (sem print) | Mesmo alerta do topo com texto "Não foi possível salvar agora. Tente de novo." e campos preservados. |
| sucesso | `14` | Fecha o modal, mostra toast e destaca a linha nova. |

Fechar: ×, Cancelar, Esc, clique no overlay (desktop). Se houver dados digitados, fechar sem confirmação é aceitável no MVP.

---

## D. Excluir movimentação

### 32 · Detalhe (mobile) — `32-detalhe-da-movimentacao`
Bottom sheet aberto ao tocar numa linha. Eyebrow `MOVIMENTAÇÃO`, título "Detalhes.", card com descrição completa, valor com sinal, etiqueta de tipo e data (`22 SET 2026`). Botões: "Excluir movimentação" (outline vermelho) e "Fechar".

### 33 / 36 · Confirmar exclusão — `33-confirmar-exclusao` (mobile), `36-confirmar-exclusao-desktop`
Eyebrow vermelho `CONFIRMAR EXCLUSÃO`, título "Excluir esta movimentação?", mesmo card, texto "A movimentação sai do histórico e o saldo passa de **R$ A** para **R$ B**. Não dá para desfazer." Botões: "Sim, excluir" (perigo) e "Cancelar". Desktop: modal 480px, `role="alertdialog"`, aberto pelo botão "Excluir" da linha (pula o detalhe). Foco inicial em "Cancelar".

### 34 · Excluindo — `34-excluindo`
"Excluindo…" com fundo `#8a4a44`, todos os botões desabilitados.

### 35 · Após excluir — ver estados do dashboard.

---

## Acessibilidade (todas as telas)

- `<label for>` em todo input; mensagens de erro ligadas por `aria-describedby`; `aria-invalid` em campos com erro.
- Modais: `role="dialog"` (exclusão: `alertdialog`), `aria-labelledby` no título, foco preso dentro, Esc fecha, foco volta ao botão que abriu.
- Toasts: `role="status"`. Alertas de erro: `role="alert"`.
- Contraste mínimo 4.5:1 já validado nas cores acima.
- Linhas do histórico no mobile são `<button>` com `aria-label="Detalhes de <descrição>"`.
