# 06 — Componentes e estrutura

## Estrutura de pastas sugerida

```
app/
  layout.tsx                 # fontes (next/font), globals.css, <ToastProvider>
  globals.css                # @import "tailwindcss"; + handoff/design/tokens.css
  (auth)/
    layout.tsx               # AuthShell: painel de marca (desktop) / header slab (mobile)
    login/page.tsx
    cadastro/page.tsx
    recuperar-senha/page.tsx
    nova-senha/page.tsx
    actions.ts
  auth/callback/route.ts
  (app)/
    layout.tsx               # AppHeader
    page.tsx                 # Dashboard (Server Component)
    loading.tsx
    error.tsx
    actions.ts
components/
  ui/        Button, TextField, MoneyField, DateField, Alert, TypeTag, Skeleton, Dialog, Sheet, Toast
  brand/     Logo, Eyebrow, SectionIndex, BrandPanel
  finance/   SummarySlab, TransactionTable, TransactionList, TransactionRow*, EmptyState,
             TransactionDialog, TransactionForm, DeleteDialog, TransactionDetail, MobileActionBar
lib/
  supabase/  client.ts, server.ts, middleware.ts
  money.ts   parseBRLToCents, formatBRL
  dates.ts   todayInSaoPaulo, formatDateDesktop, formatDateMobile
  copy.ts
  validation.ts
middleware.ts
```

## Componentes

| Componente | Tipo | Props principais | Telas |
|---|---|---|---|
| `Button` | client-safe | `variant: 'primary' \| 'secondary' \| 'danger' \| 'danger-outline' \| 'ghost'`, `size: 'md' \| 'lg'`, `pending`, `pendingLabel`, `fullWidth` | todas |
| `TextField` | — | `label`, `error`, `hint`, `hintTone`, input props | auth, modal |
| `MoneyField` | client | `type: TransactionType`, `error`, `name` — prefixo `+ R$`/`− R$` com fundo semântico, máscara de centavos | modal |
| `DateField` | client | `defaultValue = hoje`, `max = hoje`, mostra `HOJE` quando igual | modal |
| `Alert` | — | `tone: 'error' \| 'info'`, `title`, children | auth, dashboard, modal |
| `TypeTag` | — | `type`, `size` — `↗ RECEITA` / `↘ DESPESA` | tabela, lista, modal, detalhe |
| `Skeleton` | — | `tone: 'light' \| 'slab'`, `w`, `h` | loading |
| `Dialog` | client | `open`, `onClose`, `labelledBy`, `role` — desktop centralizado | modal, exclusão |
| `Sheet` | client | mesmas props — mobile, ancorado embaixo, alça | modal, detalhe, exclusão |
| `ResponsiveDialog` | client | escolhe `Dialog` ≥ 768px e `Sheet` < 768px (via CSS ou matchMedia) | — |
| `Toast` | client | `title`, `body`, `onClose`, auto-dismiss 5s | sucesso |
| `BrandPanel` | server | `display`, `body` | auth desktop |
| `SummarySlab` | server | `summary`, `variant: 'desktop' \| 'mobile'`, `state` | dashboard |
| `TransactionTable` | server | `rows` — desktop, com coluna de ação | dashboard |
| `TransactionList` | client | `rows` — mobile, linhas-botão que abrem detalhe | dashboard |
| `EmptyState` | server | `variant` | vazio |
| `TransactionDialog` | client | `type`, `open`, `onClose` — usa `TransactionForm` | criar |
| `TransactionForm` | client | `type` — `useActionState(createTransaction.bind(null, type))` | criar |
| `DeleteDialog` | client | `transaction`, `balanceBefore` — calcula saldo depois | excluir |
| `MobileActionBar` | client | abre os dialogs | mobile |

Regra: Server Components por padrão. `'use client'` só em quem tem estado, eventos ou hooks de formulário. A página do dashboard é server e injeta os dados em ilhas client (`TransactionList`, `MobileActionBar`, CTAs).

## Responsividade

Uma página por rota; alternar layouts com classes (`md:hidden`, `hidden md:block`) — não duplicar busca de dados. Tabela desktop e lista mobile recebem o mesmo array.
