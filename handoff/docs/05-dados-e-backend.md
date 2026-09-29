# 05 — Dados e backend

## Modelo

Migração completa em `supabase/migrations/0001_init.sql`.

`transactions`
| Coluna | Tipo | Regra |
|---|---|---|
| id | uuid | pk |
| user_id | uuid | default `auth.uid()`, FK `auth.users`, cascade |
| type | enum `income` \| `expense` | obrigatório; vem do modal (fixo), nunca de input livre |
| description | text | 1–80 caracteres após trim |
| amount_cents | bigint | > 0; valor sempre positivo, o sinal vem de `type` |
| occurred_at | date | default hoje; não pode ser futuro (validar na action) |
| created_at | timestamptz | default now() |

`profiles`: `id`, `name` — preenchido por trigger a partir de `options.data.name` do `signUp`.

`transaction_summary` (view, `security_invoker`): `income_cents`, `expense_cents`, `balance_cents`, `income_count`, `expense_count`. Se o usuário não tiver movimentações, a view retorna zero linhas → tratar como tudo zero.

Ordenação do histórico: `order by occurred_at desc, created_at desc`.

## Dinheiro

- Armazenar e trafegar em **centavos inteiros**. Converter só na borda (input e exibição).
- Parse do input pt-BR: remover tudo que não é dígito, interpretar como centavos (`"1.800,00"` → `180000`). Máscara ao digitar: o usuário digita só números e o campo formata da direita para a esquerda.
- Exibição: `formatBRL(cents)` → `"4.406,55"`; montar `+ R$ `, `− R$ ` ou `R$ ` na UI.
- Limite: 99.999.999.999 centavos.

## Autenticação (Supabase Auth, email + senha)

Usar `@supabase/ssr` com três clientes: browser, server (Server Components/Actions, via `cookies()`) e middleware (refresh de sessão). Middleware protege `/` e redireciona usuário logado que acessa `/login` ou `/cadastro`.

| Fluxo | Chamada |
|---|---|
| Cadastro | `supabase.auth.signUp({ email, password, options: { data: { name }, emailRedirectTo } })` |
| Login | `signInWithPassword` — qualquer erro vira a mensagem genérica |
| Logout | `signOut` + redirect `/login` (Server Action) |
| Pedir link | `resetPasswordForEmail(email, { redirectTo: '<origin>/auth/callback?next=/nova-senha' })` — sempre mostrar a etapa "enviado", mesmo se o email não existir |
| Callback | Route handler `app/auth/callback/route.ts` troca o `code` por sessão; se falhar → `/nova-senha?erro=expirado` |
| Nova senha | `updateUser({ password })` → redirect `/` |

**Nota de segurança sobre "Este email já tem conta"**: com confirmação de email ligada (padrão do Supabase), `signUp` para email existente não retorna erro — retorna um usuário "falso" para não revelar a conta. Nesse caso, a mensagem do design não aparece e o fluxo segue para "confira seu email". Decisão recomendada para o trabalho: **desligar a confirmação de email** no painel do Supabase (simplifica a demonstração) e aceitar que o cadastro revela a existência do email, OU manter a confirmação e remover essa mensagem. Documentar a escolha.

## Server Actions

Todas em `app/(app)/actions.ts` (ou `lib/actions/`), com `'use server'`, validação com **Zod**, retorno tipado e `revalidatePath('/')` após escrita.

```ts
type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; fieldErrors?: Partial<Record<'description' | 'amount' | 'occurredAt', string>>; formError?: string };
```

| Action | Entrada | Regra |
|---|---|---|
| `createTransaction(type, formData)` | description, amount (string pt-BR), occurredAt (YYYY-MM-DD) | valida; `type` vem por bind no servidor, não do form; insere; retorna a linha criada (para destacar e montar o toast) |
| `deleteTransaction(id)` | uuid | `delete ... where id = $1` — a RLS garante que só apaga o que é do usuário; se 0 linhas afetadas → erro |
| `signOut()` | — | — |

Schema Zod (referência):
```ts
const txSchema = z.object({
  description: z.string().trim().min(1, 'Informe uma descrição.').max(80, 'Use no máximo 80 caracteres.'),
  amountCents: z.number().int().positive('O valor precisa ser maior que zero.').max(99_999_999_999),
  occurredAt: z.string().date().refine(d => d <= todayInSaoPaulo(), 'A data não pode ser no futuro.'),
});
```
"Hoje" é calculado no fuso `America/Sao_Paulo`, tanto no default do input quanto na validação.

## Leitura (Server Components)

`app/(app)/page.tsx` busca em paralelo:
- `from('transaction_summary').select('*').maybeSingle()`
- `from('transactions').select('id,type,description,amount_cents,occurred_at,created_at').order('occurred_at',{ascending:false}).order('created_at',{ascending:false}).limit(50)`

Com mais de 50 itens, botão "Mostrar mais" (paginação por `range`) — não desenhado, usar o botão secundário padrão, centralizado abaixo da lista.

Estados:
- `loading.tsx` → skeleton (telas 10/16)
- `error.tsx` (Client Component) → alerta com "Tentar novamente" chamando `reset()` (telas 11/17)
- lista vazia → estado vazio (telas 09/15)
- `balance_cents < 0` → estado negativo (telas 24/25)

## Feedback após escrita

Usar `useActionState` no formulário do modal para erros e pending. Em sucesso: fechar modal, disparar toast (store client leve ou contexto) com os dados retornados, destacar a linha pelo `id` por ~3s. Pode usar `useOptimistic` para a lista, mas não é obrigatório.
