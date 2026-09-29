// Todos os textos da interface. Fonte: handoff/docs/04-copy.md (não reescrever sem aprovação).
// Chaves marcadas com "(adicionado)" não estavam no 04-copy e foram registradas lá na seção
// "Adicionados na implementação".

import { MINUS, formatBRL } from "./money";

function plural(n: number, singular: string, pluralForm: string): string {
  return `${n} ${n === 1 ? singular : pluralForm}`;
}

export const copy = {
  brand: "Saldo.",
  header: { logout: "Sair" },
  type: { income: "↗ RECEITA", expense: "↘ DESPESA" },
  common: {
    cancel: "Cancelar",
    close: "Fechar",
    retry: "Tentar novamente",
    backToLogin: "← Voltar para o login",
    closeToast: "Fechar aviso", // (adicionado) aria-label do × do toast, como no HTML 14
  },

  brandPanel: {
    eyebrow: "01 · FINANÇAS PESSOAIS",
    login: { display: "Seu dinheiro,", displayAccent: "em ordem.", body: "Registre o que entra e o que sai. Saiba o seu saldo sem abrir planilha." },
    signup: { display: "Comece do", displayAccent: "zero.", body: "Crie a conta e registre a primeira movimentação em menos de um minuto." },
    signupMobile: { display: "Criar", displayAccent: "conta." }, // (adicionado) slab do cadastro mobile, print 05m
    footer: ["RECEITAS", "DESPESAS", "SALDO"] as const,
  },

  login: {
    eyebrow: "ACESSO",
    title: "Entrar na conta.",
    subtitle: "Use o email e a senha cadastrados.",
    email: "EMAIL",
    emailPlaceholder: "voce@email.com",
    password: "SENHA",
    forgot: "Esqueci minha senha",
    submit: "Entrar",
    submitting: "Entrando…",
    errorTitle: "NÃO FOI POSSÍVEL ENTRAR",
    errorBody: "Email ou senha incorretos. Confira e tente de novo.",
    signupPrompt: "Ainda não tem conta?",
    signupLink: "Criar conta",
  },

  signup: {
    eyebrow: "CADASTRO",
    title: "Criar conta.",
    name: "NOME",
    namePlaceholder: "Como quer ser chamado",
    email: "EMAIL",
    password: "SENHA",
    passwordHint: "MÍNIMO DE 8 CARACTERES",
    confirm: "CONFIRMAR SENHA",
    submit: "Criar conta",
    submitting: "Criando conta…",
    errorEmailTaken: "Este email já tem conta.",
    errorEmailTakenLink: "Entrar",
    errorPasswordShort: (n: number) => `A senha tem ${n} caracteres. Use pelo menos 8.`,
    errorMismatch: "As senhas não coincidem.",
    errorEmailInvalid: "Informe um email válido.",
    errorNameRequired: "Informe seu nome.",
    errorServer: "Não foi possível criar a conta agora. Tente de novo.", // (adicionado)
    loginPrompt: "Já tem conta?",
    loginLink: "Entrar",
  },

  reset: {
    request: {
      eyebrow: "RECUPERAR ACESSO",
      title: "Esqueceu a senha?",
      body: "Informe o email da conta. Enviamos um link para você criar uma nova senha.",
      submit: "Enviar link",
      submitting: "Enviando…", // (adicionado)
    },
    sent: {
      eyebrow: "EMAIL ENVIADO",
      title: "Confira sua caixa de entrada.",
      bodyBefore: "Se existir uma conta com",
      bodyAfter: ", o link chega em alguns minutos. Ele vale por 1 hora.",
      helpTitle: "NÃO CHEGOU?",
      helpBody: "Veja a pasta de spam ou peça um novo envio.",
      resend: "Reenviar email",
    },
    new: {
      eyebrow: "NOVA SENHA",
      title: "Crie uma nova senha.",
      body: "Depois de salvar, você entra direto na conta.",
      password: "NOVA SENHA",
      confirm: "CONFIRMAR NOVA SENHA",
      submit: "Salvar nova senha",
      submitting: "Salvando…", // (adicionado)
      errorServer: "Não foi possível salvar a nova senha. Tente de novo.", // (adicionado)
    },
    expired: {
      eyebrow: "LINK INVÁLIDO",
      title: "Este link expirou.",
      body: "Links de recuperação valem por 1 hora e só funcionam uma vez. Peça um novo para continuar.",
      submit: "Pedir novo link",
    },
    errorServer: "Não foi possível enviar o link agora. Tente de novo.", // (adicionado)
  },

  // V4 (doc 11)
  nav: {
    label: "Principal",
    home: "Início",
    transactions: "Movimentações",
    reports: "Relatórios",
    settings: "Configurações",
    transactionsShort: "EXTRATO", // barra inferior: "MOVIMENTAÇÕES" não cabe com 5 posições (doc 11)
    settingsShort: "AJUSTES", // (adicionado) barra inferior, pelo mesmo motivo
    newLabel: "Adicionar movimentação",
    collapse: "Recolher menu", // (adicionado)
    expand: "Expandir menu", // (adicionado)
    chooseEyebrow: "NOVA MOVIMENTAÇÃO", // (adicionado) sheet do "+" no mobile
    chooseTitle: "O que você vai registrar?", // (adicionado)
  },

  home: {
    topTitle: (name: string) => `Maiores gastos de ${name}.`,
    topMore: "Ver relatório →",
    recentTitle: "Últimas movimentações.",
    recentMore: "Ver todas →",
  },

  settings: {
    eyebrow: "04 · CONFIGURAÇÕES", // (adicionado)
    title: "Configurações.",
    categories: {
      title: "Categorias.",
      expense: "DESPESA",
      income: "RECEITA",
      count: (n: number) => plural(n, "movimentação", "movimentações"),
      newLabel: "NOVA CATEGORIA",
      add: "Adicionar",
      rename: "Renomear",
      renameLabel: (name: string) => `Renomear ${name}`, // (adicionado) aria-label
      save: "Salvar",
      delete: "Excluir",
      deleteLabel: (name: string) => `Excluir ${name}`, // (adicionado) aria-label
      errorDuplicate: "Já existe uma categoria com esse nome.",
      deleteEyebrow: "CONFIRMAR EXCLUSÃO", // (adicionado)
      deleteTitle: (name: string) => `Excluir ${name}?`,
      deleteBody: (n: number) =>
        n === 0
          ? "Nenhuma movimentação usa esta categoria."
          : `${plural(n, "movimentação fica", "movimentações ficam")} sem categoria.`,
      deleteSubmit: "Sim, excluir", // (adicionado) igual à exclusão de movimentação
      toastRenamed: "CATEGORIA RENOMEADA",
      toastDeleted: "CATEGORIA EXCLUÍDA",
      toastAdded: "CATEGORIA ADICIONADA", // (adicionado)
    },
    profile: {
      title: "Perfil.",
      name: "NOME",
      email: "EMAIL",
      save: "Salvar nome",
      toast: "NOME ATUALIZADO",
    },
    password: {
      title: "Senha.",
      new: "NOVA SENHA",
      confirm: "CONFIRME A SENHA",
      save: "Alterar senha",
      toast: "SENHA ALTERADA",
      toastBody: "Use a nova senha no próximo acesso.", // (adicionado)
    },
    appearance: {
      title: "Aparência.",
      label: "TEMA", // (adicionado) aria-label do controle
      options: { claro: "CLARO", escuro: "ESCURO", sistema: "SISTEMA" },
    },
    logout: "Sair da conta",
  },

  transactions: {
    eyebrow: "02 · MOVIMENTAÇÕES", // (adicionado)
    title: "Movimentações.", // (adicionado)
  },

  search: {
    label: "Buscar por descrição", // V8
    placeholder: "Buscar no mês", // V8
    clear: "Limpar busca", // V8
    emptyTitle: (term: string) => `Nada com "${term}" neste mês.`, // V8
    emptyBody: "Confira a grafia ou procure em outro mês.", // V8
  },

  reports: {
    eyebrow: "03 · RELATÓRIOS", // (adicionado)
    title: "Relatórios.", // (adicionado)
  },

  dash: {
    eyebrow: "01 · VISÃO GERAL",
    title: "Suas finanças.",
    ctaExpense: "Adicionar despesa",
    ctaExpenseMobile: "Despesa",
    ctaIncome: "Adicionar receita",
    ctaIncomeMobile: "Receita",
    ctaNav: "Adicionar movimentação", // (adicionado) aria-label da barra inferior, como no HTML 06
    balanceLabel: "SALDO ATUAL",
    balanceCaption: "Receitas menos despesas registradas.",
    balanceNegativeTag: "↘ SALDO NEGATIVO",
    balanceNegativeCaption: (diffCents: number) =>
      `As despesas superaram as receitas em R$ ${formatBRL(diffCents)}.`,
    incomeLabel: "↗ TOTAL DE RECEITAS",
    incomeLabelMobile: "↗ RECEITAS",
    incomeCount: (n: number) => plural(n, "entrada", "entradas"),
    expenseLabel: "↘ TOTAL DE DESPESAS",
    expenseLabelMobile: "↘ DESPESAS",
    expenseCount: (n: number) => plural(n, "saída", "saídas"),
    unavailable: "Indisponível",
    unavailableValue: "R$ —",
    loadingCaption: "Carregando…", // (adicionado) prints 10 e 16
    summaryLabel: "Resumo", // (adicionado) aria-label do slab, como no HTML 06
    historyIndex: "03",
    historyTitle: "Histórico de movimentações.",
    historyTitleMobile: "Histórico.",
    historyOrder: "MAIS RECENTES PRIMEIRO",
    // V2 (filtro por mês)
    balanceCaptionV2: "Acumulado de todas as movimentações até hoje.",
    balanceLabelMobileV2: "SALDO ATUAL · ACUMULADO",
    incomeLabelV2: (short: string) => `↗ RECEITAS EM ${short}`,
    incomeLabelMobileV2: (short: string) => `↗ RECEITAS · ${short}`,
    expenseLabelV2: (short: string) => `↘ DESPESAS EM ${short}`,
    expenseLabelMobileV2: (short: string) => `↘ DESPESAS · ${short}`,
    resultLabel: (name: string, year: string) => `RESULTADO DE ${name.toUpperCase()} ${year}`,
    resultLabelMobile: "RESULTADO DO MÊS",
    resultCaption: "receitas menos despesas do mês",
    historyTitleV2: (name: string) => `Movimentações de ${name}.`,
    // V3 (filtro por categoria)
    historyTitleFiltered: (name: string, category: string) => `Movimentações de ${name} em ${category}.`,
    filterRemove: (category: string) => `Remover filtro ${category}`,
    monthEmptyIndex: (name: string, year: string) => `00 MOVIMENTAÇÕES EM ${name.toUpperCase()} ${year}`,
    monthEmptyTitle: (name: string) => `Nada registrado em ${name}.`,
    monthEmptyBody: "Troque o período acima ou registre uma movimentação com data deste mês.",
    table: { date: "DATA", desc: "DESCRIÇÃO", type: "TIPO", value: "VALOR" },
    rowEdit: "Editar",
    rowEditLabel: (description: string) => `Editar ${description}`,
    rowDelete: "Excluir",
    rowDeleteLabel: (description: string) => `Excluir ${description}`,
    rowDetailLabel: (description: string) => `Detalhes de ${description}`,
    rowToday: "HOJE",
    loadMore: "Mostrar mais", // (adicionado) paginação acima de 50 itens, citada no doc 05
    loading: "CARREGANDO MOVIMENTAÇÕES…",
    errorTitle: "ERRO AO CARREGAR",
    errorBody: "Não foi possível buscar suas movimentações. Verifique a conexão e tente de novo.",
    emptyIndex: "00 MOVIMENTAÇÕES",
    emptyTitle: "Nada registrado ainda.",
    emptyBody: "Registre a primeira receita ou despesa. O saldo se atualiza a cada lançamento.",
    emptyHint: "USE OS BOTÕES ACIMA ↗",
    emptyHintMobile: "USE OS BOTÕES ABAIXO ↓",
  },

  tx: {
    eyebrow: "NOVA MOVIMENTAÇÃO",
    title: { income: "Adicionar receita.", expense: "Adicionar despesa." },
    hint: { income: "Tipo fixo · entra somando no saldo", expense: "Tipo fixo · sai subtraindo do saldo" },
    hintMobile: { income: "Tipo fixo · soma no saldo", expense: "Tipo fixo · subtrai do saldo" },
    description: "DESCRIÇÃO",
    descriptionPlaceholder: { income: "Ex.: Salário", expense: "Ex.: Supermercado" },
    amount: "VALOR",
    amountPlaceholder: "0,00",
    date: "DATA",
    dateToday: "HOJE",
    dateHelp: "Preenchida com hoje. Altere para lançar algo que já aconteceu.",
    submit: { income: "Salvar receita", expense: "Salvar despesa" },
    submitting: "Salvando…",
    errorSummary: "Revise os campos marcados para salvar.",
    errorDescription: "Informe uma descrição.",
    errorDescriptionLong: "Use no máximo 80 caracteres.",
    errorAmount: "O valor precisa ser maior que zero.",
    errorAmountMax: "O valor máximo é R$ 999.999.999,99.",
    errorDateFuture: "A data não pode ser no futuro.",
    errorDateInvalid: "Informe uma data válida.", // (adicionado)
    errorServer: "Não foi possível salvar agora. Tente de novo.",
    toastTitle: { income: "RECEITA SALVA", expense: "DESPESA SALVA" },
    toastBody: {
      income: (cents: number) => `+ R$ ${formatBRL(cents)} somados ao saldo.`,
      expense: (cents: number) => `${MINUS} R$ ${formatBRL(cents)} subtraídos do saldo.`,
    },
  },

  period: {
    label: "PERÍODO",
    prev: "Mês anterior",
    next: "Próximo mês",
    back: "Voltar para o mês atual →",
    title: (name: string, year: string) => `${name.toUpperCase()} ${year}`,
    savedIn: (name: string, year: string) => `Salva em ${name} de ${year}.`,
    movedTo: (name: string, year: string) => `Movida para ${name} de ${year}.`,
    see: (name: string) => `Ver ${name}`,
  },

  report: {
    index: "02",
    title: (name: string) => `Para onde foi o dinheiro em ${name}.`,
    titleMobile: "Gastos por categoria.",
    aside: (n: number, total: string) => `${n} ${n === 1 ? "CATEGORIA" : "CATEGORIAS"} · TOTAL ${total}`,
    rowLabel: (category: string) => `Ver movimentações de ${category}`,
    // V7 (doc 14)
    incomeTitle: (name: string) => `De onde veio o dinheiro em ${name}.`,
    incomeTitleMobile: "Receitas por categoria.",
    incomeRowLabel: (category: string) => `Ver receitas de ${category}`,
  },

  category: {
    label: "CATEGORIA",
    none: "Sem categoria",
    newOption: "+ Nova categoria…",
    newLabel: "NOME DA CATEGORIA",
    newPlaceholder: "Ex.: Pets",
    errorNewRequired: "Informe o nome da categoria.",
    errorNewLong: "Use no máximo 30 caracteres.",
  },

  edit: {
    eyebrow: "EDITAR MOVIMENTAÇÃO",
    title: { income: "Editar receita.", expense: "Editar despesa." },
    type: "TIPO",
    changed: (previous: string) => `ALTERADO · ERA ${previous}`,
    changedNone: "SEM CATEGORIA",
    impact: { before: "O saldo passa de", middle: "para", after: "." },
    submit: "Salvar alterações",
    detailAction: "Editar movimentação",
    toastTitle: { income: "RECEITA ATUALIZADA", expense: "DESPESA ATUALIZADA" },
    toastBody: (description: string, signedAmount: string, balance: string) =>
      `${description} agora é ${signedAmount}. Saldo: ${balance}.`,
  },

  // V6 (doc 13)
  recurrence: {
    repeat: "Repetir todo mês",
    help: (day: number) => `Lançada todo dia ${day}. Em meses mais curtos, no último dia.`,
    tag: "MENSAL",
    fromSeries: "Faz parte de uma recorrência mensal.",
    manage: "Gerenciar",
    title: "Recorrências.",
    dayLabel: (day: number) => `TODO DIA ${day}`,
    empty: 'Nenhuma recorrência ativa. Marque "Repetir todo mês" ao adicionar uma receita ou despesa.',
    edit: "Editar",
    editLabel: (description: string) => `Editar ${description}`, // (adicionado) aria-label
    editTitle: "Editar recorrência.",
    editNote: "Vale para os próximos lançamentos. Os já feitos não mudam.",
    save: "Salvar recorrência",
    end: "Encerrar",
    endLabel: (description: string) => `Encerrar ${description}`, // (adicionado) aria-label
    endTitle: "Encerrar recorrência?",
    endBody: (description: string) =>
      `${description} para de ser lançada. As movimentações já feitas continuam no histórico.`,
    endConfirm: "Encerrar recorrência",
    ending: "Encerrando…",
    toastTitle: "RECORRÊNCIA CRIADA",
    toastBody: (day: number) => `Lançada todo dia ${day}.`,
    toastBodyBackfill: (day: number, n: number) => `Lançada todo dia ${day}. ${n} lançamentos até hoje.`,
    toastUpdated: "RECORRÊNCIA ATUALIZADA",
    toastEnded: "RECORRÊNCIA ENCERRADA",
    errorDateOld: "A data inicial pode ser de até 12 meses atrás.",
  },

  del: {
    detailEyebrow: "MOVIMENTAÇÃO",
    detailTitle: "Detalhes.",
    detailAction: "Excluir movimentação",
    confirmSubmitting: "Excluindo…", // usado na exclusão de categoria
    error: "Não foi possível excluir agora. Tente de novo.",
    toastTitle: { income: "RECEITA EXCLUÍDA", expense: "DESPESA EXCLUÍDA" },
    toastBody: (description: string, balance: string) => `${description} · saldo agora é ${balance}.`,
    toastUndo: "Desfazer", // V8
    toastUndone: "Exclusão desfeita.", // V8, só para leitor de tela
    toastErrorTitle: "EXCLUSÃO NÃO CONCLUÍDA", // V8
  },
} as const;
