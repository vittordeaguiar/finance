# 04 — Copy (pt-BR)

Centralize em `lib/copy.ts`. Não reescrever textos sem aprovação. `{x}` = valor dinâmico. `−` é U+2212.

## Global

| Chave | Texto |
|---|---|
| brand | Saldo. |
| header.logout | Sair |
| money.income | + R$ {valor} |
| money.expense | − R$ {valor} |
| type.income | ↗ RECEITA |
| type.expense | ↘ DESPESA |
| common.cancel | Cancelar |
| common.close | Fechar |
| common.retry | Tentar novamente |
| common.back_to_login | ← Voltar para o login |

## Painel de marca (login, cadastro, recuperação — desktop)

| Chave | Texto |
|---|---|
| brand.eyebrow | 01 · FINANÇAS PESSOAIS |
| brand.login.display | Seu dinheiro, em ordem. ("em ordem." em verde) |
| brand.login.body | Registre o que entra e o que sai. Saiba o seu saldo sem abrir planilha. |
| brand.signup.display | Comece do zero. ("zero." em verde) |
| brand.signup.body | Crie a conta e registre a primeira movimentação em menos de um minuto. |
| brand.footer | RECEITAS · DESPESAS · SALDO |

## Login

| Chave | Texto |
|---|---|
| login.eyebrow | ACESSO |
| login.title | Entrar na conta. |
| login.subtitle | Use o email e a senha cadastrados. (só desktop) |
| login.email | EMAIL |
| login.email.placeholder | voce@email.com |
| login.password | SENHA |
| login.forgot | Esqueci minha senha |
| login.submit | Entrar → |
| login.submitting | Entrando… |
| login.error.title | NÃO FOI POSSÍVEL ENTRAR |
| login.error.body | Email ou senha incorretos. Confira e tente de novo. |
| login.signup | Ainda não tem conta? Criar conta |

## Cadastro

| Chave | Texto |
|---|---|
| signup.eyebrow | CADASTRO |
| signup.title | Criar conta. |
| signup.name | NOME |
| signup.name.placeholder | Como quer ser chamado |
| signup.email | EMAIL |
| signup.password | SENHA |
| signup.password.hint | MÍNIMO DE 8 CARACTERES |
| signup.confirm | CONFIRMAR SENHA |
| signup.submit | Criar conta → |
| signup.submitting | Criando conta… |
| signup.error.email_taken | Este email já tem conta. Entrar |
| signup.error.password_short | A senha tem {n} caracteres. Use pelo menos 8. |
| signup.error.mismatch | As senhas não coincidem. |
| signup.error.email_invalid | Informe um email válido. |
| signup.error.name_required | Informe seu nome. |
| signup.login | Já tem conta? Entrar |

## Recuperação de senha

| Chave | Texto |
|---|---|
| reset.request.eyebrow | RECUPERAR ACESSO |
| reset.request.title | Esqueceu a senha? |
| reset.request.body | Informe o email da conta. Enviamos um link para você criar uma nova senha. |
| reset.request.submit | Enviar link → |
| reset.sent.eyebrow | EMAIL ENVIADO |
| reset.sent.title | Confira sua caixa de entrada. |
| reset.sent.body | Se existir uma conta com {email}, o link chega em alguns minutos. Ele vale por 1 hora. |
| reset.sent.help.title | NÃO CHEGOU? |
| reset.sent.help.body | Veja a pasta de spam ou peça um novo envio. |
| reset.sent.resend | Reenviar email |
| reset.new.eyebrow | NOVA SENHA |
| reset.new.title | Crie uma nova senha. |
| reset.new.body | Depois de salvar, você entra direto na conta. |
| reset.new.password | NOVA SENHA |
| reset.new.confirm | CONFIRMAR NOVA SENHA |
| reset.new.submit | Salvar nova senha → |
| reset.expired.eyebrow | LINK INVÁLIDO |
| reset.expired.title | Este link expirou. |
| reset.expired.body | Links de recuperação valem por 1 hora e só funcionam uma vez. Peça um novo para continuar. |
| reset.expired.submit | Pedir novo link → |

## Dashboard

| Chave | Texto |
|---|---|
| dash.eyebrow | 01 · VISÃO GERAL |
| dash.title | Suas finanças. |
| dash.cta.expense | − Adicionar despesa (mobile: − Despesa) |
| dash.cta.income | + Adicionar receita (mobile: + Receita) |
| dash.balance.label | SALDO ATUAL |
| dash.balance.caption | Receitas menos despesas registradas. |
| dash.balance.negative.tag | ↘ SALDO NEGATIVO |
| dash.balance.negative.caption | As despesas superaram as receitas em R$ {diferença}. |
| dash.income.label | ↗ TOTAL DE RECEITAS (mobile: ↗ RECEITAS) |
| dash.income.count | {n} entrada / {n} entradas |
| dash.expense.label | ↘ TOTAL DE DESPESAS (mobile: ↘ DESPESAS) |
| dash.expense.count | {n} saída / {n} saídas |
| dash.unavailable | Indisponível |
| dash.history.index | 02 |
| dash.history.title | Histórico de movimentações. (mobile: Histórico.) |
| dash.history.order | MAIS RECENTES PRIMEIRO |
| dash.table.date / desc / type / value | DATA / DESCRIÇÃO / TIPO / VALOR |
| dash.row.delete | Excluir |
| dash.loading | CARREGANDO MOVIMENTAÇÕES… |
| dash.error.title | ERRO AO CARREGAR |
| dash.error.body | Não foi possível buscar suas movimentações. Verifique a conexão e tente de novo. |
| dash.empty.index | 00 MOVIMENTAÇÕES |
| dash.empty.title | Nada registrado ainda. |
| dash.empty.body | Registre a primeira receita ou despesa. O saldo se atualiza a cada lançamento. |
| dash.empty.hint | USE OS BOTÕES ACIMA ↗ (mobile: USE OS BOTÕES ABAIXO ↓) |

## Modal de movimentação

| Chave | Texto |
|---|---|
| tx.eyebrow | NOVA MOVIMENTAÇÃO |
| tx.title.income / expense | Adicionar receita. / Adicionar despesa. |
| tx.hint.income | Tipo fixo · entra somando no saldo (mobile: Tipo fixo · soma no saldo) |
| tx.hint.expense | Tipo fixo · sai subtraindo do saldo (mobile: Tipo fixo · subtrai do saldo) |
| tx.description | DESCRIÇÃO |
| tx.description.placeholder.income / expense | Ex.: Salário / Ex.: Supermercado |
| tx.amount | VALOR |
| tx.date | DATA |
| tx.date.today | HOJE |
| tx.date.help | Preenchida com hoje. Altere para lançar algo que já aconteceu. |
| tx.submit.income / expense | Salvar receita / Salvar despesa |
| tx.submitting | Salvando… |
| tx.error.summary | Revise os campos marcados para salvar. |
| tx.error.description | Informe uma descrição. |
| tx.error.description_long | Use no máximo 80 caracteres. |
| tx.error.amount | O valor precisa ser maior que zero. |
| tx.error.amount_max | O valor máximo é R$ 999.999.999,99. |
| tx.error.date_future | A data não pode ser no futuro. |
| tx.error.server | Não foi possível salvar agora. Tente de novo. |
| tx.toast.income.title / body | RECEITA SALVA / + R$ {valor} somados ao saldo. |
| tx.toast.expense.title / body | DESPESA SALVA / − R$ {valor} subtraídos do saldo. |

## Excluir

| Chave | Texto |
|---|---|
| del.detail.eyebrow | MOVIMENTAÇÃO |
| del.detail.title | Detalhes. |
| del.detail.action | Excluir movimentação |
| del.confirm.eyebrow | CONFIRMAR EXCLUSÃO |
| del.confirm.title | Excluir esta movimentação? |
| del.confirm.body | A movimentação sai do histórico e o saldo passa de R$ {antes} para R$ {depois}. Não dá para desfazer. |
| del.confirm.submit | Sim, excluir |
| del.confirm.submitting | Excluindo… |
| del.error | Não foi possível excluir agora. Tente de novo. |
| del.toast.title | RECEITA EXCLUÍDA / DESPESA EXCLUÍDA |
| del.toast.body | {descrição} · saldo agora é R$ {saldo}. |

## V6 — Recorrências

Fonte: `13-v6-recorrencias.md`. Grupo `recurrence` em `lib/copy.ts`. Os demais erros de validação reusam os de `tx`; erro de servidor reusa `tx.errorServer`.

| Chave | Texto |
|---|---|
| recurrence.repeat | Repetir todo mês |
| recurrence.help(dia) | Lançada todo dia {dia}. Em meses mais curtos, no último dia. |
| recurrence.tag | MENSAL |
| recurrence.fromSeries | Faz parte de uma recorrência mensal. |
| recurrence.manage | Gerenciar |
| recurrence.title | Recorrências. |
| recurrence.dayLabel(dia) | TODO DIA {dia} |
| recurrence.empty | Nenhuma recorrência ativa. Marque "Repetir todo mês" ao adicionar uma receita ou despesa. |
| recurrence.edit | Editar |
| recurrence.editTitle | Editar recorrência. |
| recurrence.editNote | Vale para os próximos lançamentos. Os já feitos não mudam. |
| recurrence.save | Salvar recorrência |
| recurrence.end | Encerrar |
| recurrence.endTitle | Encerrar recorrência? |
| recurrence.endBody(descrição) | {descrição} para de ser lançada. As movimentações já feitas continuam no histórico. |
| recurrence.endConfirm | Encerrar recorrência |
| recurrence.ending | Encerrando… |
| recurrence.toastTitle | RECORRÊNCIA CRIADA |
| recurrence.toastBody(dia) | Lançada todo dia {dia}. |
| recurrence.toastBodyBackfill(dia, n) | Lançada todo dia {dia}. {n} lançamentos até hoje. |
| recurrence.toastUpdated | RECORRÊNCIA ATUALIZADA |
| recurrence.toastEnded | RECORRÊNCIA ENCERRADA |
| recurrence.errorDateOld | A data inicial pode ser de até 12 meses atrás. |
| recurrence.editLabel(descrição) | Editar {descrição} (adicionado: aria-label, como nas categorias) |
| recurrence.endLabel(descrição) | Encerrar {descrição} (adicionado: aria-label, como nas categorias) |

## V7 — Relatórios

Fonte: `14-v7-relatorios.md`. Grupo `report` em `lib/copy.ts`.

| Chave | Texto |
|---|---|
| report.incomeTitle(mês) | De onde veio o dinheiro em {mês}. |
| report.incomeTitleMobile | Receitas por categoria. |
| report.incomeRowLabel(categoria) | Ver receitas de {categoria} |

`reports.emptyTitle` e `reports.emptyBody` saíram: o mês vazio em Relatórios usa `dash.monthEmpty*`.

## V8 — Desfazer exclusão e busca

Fonte: `15-v8-desfazer-e-busca.md`. Grupos `del` e `search` em `lib/copy.ts`.

| Chave | Texto |
|---|---|
| del.toast.undo | Desfazer |
| del.toast.undone | Exclusão desfeita. |
| del.toast.errorTitle | EXCLUSÃO NÃO CONCLUÍDA |
| search.label | Buscar por descrição |
| search.placeholder | Buscar no mês |
| search.clear | Limpar busca |
| search.emptyTitle(termo) | Nada com "{termo}" neste mês. |
| search.emptyBody | Confira a grafia ou procure em outro mês. |

`del.confirm.*` saem: a exclusão não pede mais confirmação. `del.confirm.submitting` (Excluindo…) fica, porque a exclusão de categoria usa.

## Formatos

- Moeda: `Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })` e prefixar `R$ ` manualmente com o sinal: `+ R$ 1.800,00`, `− R$ 412,80`, saldo `R$ 4.406,55` ou `− R$ 312,40`.
- Data no desktop: `22 set 2026` (dia 2 dígitos, mês abreviado minúsculo sem ponto, ano).
- Data no mobile e no detalhe: `22 SET` / `22 SET 2026`.
- Movimentação criada hoje pode mostrar `HOJE` no lugar da data no mobile (opcional).

## Adicionados na implementação

Textos que faltavam no design (combinado na análise pré-Fase 0). Mesmo tom das mensagens existentes.

| Chave | Texto | Onde |
|---|---|---|
| common.close_toast | Fechar aviso | aria-label do × do toast (HTML 14) |
| brand.signup.mobile.display | Criar conta. ("conta." em verde) | slab do cadastro mobile (print 05m) |
| signup.error.server | Não foi possível criar a conta agora. Tente de novo. | cadastro, erro do Supabase |
| reset.request.submitting | Enviando… | botão "Enviar link" em progresso |
| reset.new.submitting | Salvando… | botão "Salvar nova senha" em progresso |
| reset.new.error.server | Não foi possível salvar a nova senha. Tente de novo. | nova senha, erro do Supabase |
| reset.error.server | Não foi possível enviar o link agora. Tente de novo. | pedir link, erro do Supabase |
| dash.cta.nav | Adicionar movimentação | aria-label da barra inferior (HTML 06) |
| dash.summary.label | Resumo | aria-label do slab (HTML 06) |
| dash.loading.caption | Carregando… | legendas do slab carregando (prints 10 e 16) |
| dash.unavailable.value | R$ — | saldo indisponível (print 17) |
| dash.row.today | HOJE | data da linha criada hoje no mobile (vale sobre o "AGORA" do print 14) |
| dash.load_more | Mostrar mais | paginação acima de 50 itens (doc 05) |
| tx.error.date_invalid | Informe uma data válida. | data vazia ou inválida no modal |

Decisão: quando o texto de um print diverge deste documento, vale este documento (ex.: legenda do saldo negativo no desktop).
