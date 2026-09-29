# Saldo.

Aplicação web de controle de finanças pessoais (projeto acadêmico). O usuário registra receitas e despesas e acompanha o saldo, os totais e o histórico.

**Stack:** Next.js 16 (App Router, Server Components e Server Actions) · TypeScript strict · Supabase (Auth + PostgreSQL com RLS) · Tailwind CSS v4 · Zod · Vitest.

Design, regras de negócio e textos estão em [`handoff/`](handoff/README.md).

## Funcionalidades

- Cadastro, login, logout e recuperação de senha por email.
- Saldo atual, total de receitas e de despesas, com contagens e estado de saldo negativo.
- Criação de receita ou despesa com descrição, valor e data (sem datas futuras).
- Histórico em ordem cronológica, com tabela no desktop e lista no mobile.
- Exclusão com confirmação, mostrando o saldo antes e depois.
- Estados de carregando, vazio, erro ao carregar e sucesso, com toast e destaque da linha nova.
- Receita e despesa se distinguem por sinal (`+`/`−`), seta (`↗`/`↘`), etiqueta com texto e cor.

## Como rodar

Pré-requisitos: Node 22+, npm e um projeto Supabase (na nuvem, ou local com Docker e a CLI do Supabase).

```bash
npm install
cp .env.local.example .env.local   # URL e publishable/anon key do projeto
npm run dev                        # http://localhost:3000
```

### Banco de dados

As migrações ficam em `supabase/migrations/`. Aplique todas em ordem:

| Arquivo | O que faz |
|---|---|
| `0001_init.sql` | Tabela `transactions`, índice, RLS, view `transaction_summary`, `profiles` e o trigger que cria o perfil |
| `0002_grants.sql` | Permissões da Data API para o papel `authenticated`. Sem elas, toda leitura falha com *permission denied* |
| `0003_update_policy.sql` | V2: policy `update own` e permissão de `update` para a edição de movimentação |
| `0004_categories.sql` | V3: tabela `categories` (RLS), `category_id` em `transactions` com FK composta, categorias padrão (trigger e backfill) |
| `0005_category_totals.sql` | V3: função `category_totals` (despesas do mês por categoria, sob RLS) para o relatório |
| `0006_settings.sql` | V4: renomear e excluir categorias, editar o nome do perfil, RPC `category_usage` |

**Supabase na nuvem:** rode `supabase link --project-ref <ref>` e depois `supabase db push`. Outra opção é colar os arquivos no SQL Editor, em ordem. Depois, no painel do projeto:

1. **Authentication → Sign In / Providers → Email:** desligue *Confirm email* (veja as decisões abaixo).
2. **Authentication → URL Configuration:** use `Site URL` = URL do app e inclua `<URL do app>/auth/callback` em *Redirect URLs*.
3. **Authentication → Emails → Reset password:** troque o link do template por
   `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery&next=/nova-senha`
   (o modelo completo está em `supabase/templates/recovery.html`).
4. Opcional: *Minimum password length* = 8, para bater com a validação do app.

**Supabase local:** `supabase start`. O `supabase/config.toml` já traz as portas 563xx, a confirmação desligada, a senha mínima 8 e o template de recuperação. Os emails ficam no Mailpit (`http://127.0.0.1:56324`). A URL e a chave para o `.env.local` saem de `supabase status`.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` / `npm start` | Build e servidor de produção |
| `npm run typecheck` | `next typegen` + `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Testes unitários (Vitest): dinheiro, datas, validação e mapeamento de dados |

## Estrutura

```
app/
  (auth)/        login, cadastro, recuperar-senha, nova-senha + actions.ts
  (app)/         dashboard (page, loading, error) + actions.ts (criar, excluir, sair)
  auth/callback/ troca o link do email por sessão
components/
  ui/            Button, TextField, MoneyField, DateField, Alert, TypeTag, Dialog, Toast…
  brand/         Logo, Eyebrow, SectionIndex, BrandPanel
  auth/          AuthShell e formulários
  finance/       SummarySlab, TransactionTable, TransactionList, diálogos de criar e excluir…
lib/
  money.ts       centavos ⇄ texto pt-BR (nunca float)
  dates.ts       "hoje" em America/Sao_Paulo e formatos de data
  copy.ts        todos os textos da interface
  validation.ts  esquemas Zod
  dashboard.ts   leitura do resumo e do histórico
  supabase/      clientes browser, server e proxy
proxy.ts         renova a sessão e protege as rotas
```

## Decisões de implementação

- **Dinheiro em centavos inteiros** do banco (`bigint`) até a tela. O campo de valor formata da direita para a esquerda e o servidor converte o texto em centavos.
- **Segurança pela RLS.** Toda leitura e escrita usa a sessão do usuário; o app nunca usa `service_role`. A exclusão pede a contagem exata de linhas, então um id de outro usuário (0 linhas afetadas) vira erro em vez de "sucesso" silencioso.
- **Confirmação de email desligada**, para o cadastro entrar direto e poder mostrar "Este email já tem conta.". Custo: o cadastro revela se um email já existe. O login e a recuperação continuam com mensagens genéricas.
- **Link de recuperação com `token_hash`**, validado no servidor com `verifyOtp`. Funciona mesmo se o email for aberto em outro dispositivo; o link padrão (PKCE) só funciona no navegador que pediu.
- **`/nova-senha` só aceita a sessão aberta pelo link**, marcada com um cookie httpOnly de 1 hora. Sem ele, a tela mostra "Este link expirou.", para que uma sessão comum não troque a senha sem o email.
- **"Hoje" no fuso de São Paulo**, tanto no valor padrão do campo quanto na validação. Datas `date` nunca passam por `new Date()`, para não recuar um dia.
- **Textos:** quando o print diverge de `handoff/docs/04-copy.md`, vale o copy. Os textos que faltavam foram registrados no próprio 04-copy, na seção "Adicionados na implementação".
- **Token `danger-pending`** (`#8a4a44`, botão "Excluindo…") adicionado ao `tokens.css`, porque o design o usava fora dos tokens.
- **Erro de leitura tratado na própria página**, para manter título, CTAs e resumo como no print 17. "Tentar novamente" refaz a busca com `router.refresh()`; o `error.tsx` fica como reserva.
- **Tentativa extra em `PGRST303`:** logo após o login, o Auth pode emitir um token com `iat` arredondado para o segundo seguinte. O dashboard tenta de novo uma única vez.
- **Faixa de 768 a 1100px:** a tabela esconde a coluna TIPO (a etiqueta vai junto da descrição) e o resumo reduz as fontes.
- **Paginação** de 50 em 50 pelo botão "Mostrar mais" (`?itens=`).

## Diferenças conhecidas em relação aos prints

- Legenda do saldo negativo no desktop: usa o texto do copy ("As despesas superaram…"), mais longo que o do print 25, e pode quebrar em duas linhas.
- A linha criada hoje mostra `HOJE` (copy) no lugar de `AGORA` (print 14).
- Toast no desktop: sem print; fica no canto inferior direito, com 400px.
- Pequenas diferenças de quebra de linha e de 1 a 4px de altura, por diferenças de renderização de fonte.
