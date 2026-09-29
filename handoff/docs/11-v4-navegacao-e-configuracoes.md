# 11 — V4: navegação por abas, Início e Configurações

**Não faz parte do MVP, da V2 nem da V3.** Implementar só depois da Fase 9 (V3 mergeada). São quatro fases, nesta ordem:

- **Fase 10 — Navegação**: layout com barra lateral (desktop) e barra inferior (mobile), abas como rotas, mês compartilhado e botão "+" global.
- **Fase 11 — Início**: a página inicial vira um resumo curto (slab, maiores gastos, últimas movimentações).
- **Fase 12 — Configurações**: categorias (criar, renomear, excluir) e perfil/senha.
- **Fase 13 — Tema escuro**: paleta escura, preferência claro/escuro/sistema.

Como na V3, **não há prints nem HTML**. As decisões visuais reaproveitam tokens, tipografia e componentes existentes. Onde este documento não disser, siga a tela vizinha. A identidade não muda: nada de cores, fontes, sombras ou raios novos, **exceto a paleta escura da Fase 13**, definida aqui.

## Por que (problemas que a V4 resolve)

1. **Dashboard longo.** Resumo, relatório e histórico empilhados numa página só; no celular, o histórico fica muito abaixo da dobra.
2. **Lançar é lento.** Os botões de criar só existem no topo do dashboard.
3. **Nada é gerenciável.** Não dá para renomear ou excluir categoria, nem trocar nome ou senha.

## Decisões de produto (já tomadas)

1. **Abas são rotas**, não estado no cliente. Cada aba é um Server Component que lê só o que precisa; a URL é compartilhável e o voltar do navegador funciona.
2. **Quatro abas**: Início, Movimentações, Relatórios, Configurações.
3. **Mês compartilhado pela URL** (`?mes=`). Os links da navegação preservam `mes`; nenhum outro parâmetro atravessa abas.
4. **Botão "+" em todas as abas.** Abre o mesmo formulário de criação de hoje (tipo fixo). Os deep links `/?novo=receita|despesa` continuam valendo e passam a funcionar em qualquer aba.
5. **Identidade mantida.** Slab preto continua sendo o destaque do resumo; verde só em acentos.
6. **Configurações é uma página**, com seções empilhadas (não sub-abas): Categorias, Perfil, Senha, Aparência (Fase 13), Sair.

## Mapa de rotas

| Rota | Aba | Conteúdo | Origem |
|---|---|---|---|
| `/` | Início | Slab do mês, maiores gastos (top 3), últimas 5 movimentações | novo (Fase 11); até lá, o dashboard atual |
| `/movimentacoes` | Movimentações | Stepper de mês, histórico com `?categoria=` e `?itens=`, edição/exclusão | `History`, `getDashboardData` (Fase 10) |
| `/relatorios` | Relatórios | Stepper de mês, `CategoryReport` | `CategoryReport`, `getCategoryTotals` (Fase 10) |
| `/configuracoes` | Configurações | Categorias, Perfil, Senha, Aparência, Sair | novo (Fases 12 e 13) |

Regras de URL:
- `?mes=` inválido ou futuro redireciona para a mesma rota sem `mes` (padrão atual).
- O drill-down do relatório passa a apontar para `/movimentacoes?mes=…&categoria=…`.
- `?categoria=` só existe em `/movimentacoes`. Trocar de mês continua limpando o filtro.
- Generalizar `dashboardHref()` (`lib/period.ts`) para receber a rota base: `navHref({ path, month, current, … })`.

## Navegação

### Desktop (≥ 768px): barra lateral

- Fixa à esquerda, largura 240px, altura total, `bg-surface`, `border-r border-border`. O conteúdo fica à direita com o padding atual (`md:px-16 md:py-12`), largura máxima inalterada.
- De cima para baixo: logo (mesmo do `AppHeader`), botão primário "+ Nova movimentação" (largura total, abre um menu com "↗ Receita" e "↘ Despesa", ou dois botões empilhados; ver "Botão +"), lista de abas, e no rodapé o email (mono, `text-text-secondary`) e "Sair".
- Item de aba: altura 44px, `px-4`, texto 15px `font-medium`. Ativo: `bg-background`, `text-text`, barra de 2px `bg-accent` à esquerda, `aria-current="page"`. Inativo: `text-text-secondary`, hover `text-text`.
- Ícones: nenhum além dos caracteres unicode do design system. As abas são só texto; a barra de ativo carrega o estado.
- O `AppHeader` atual sai no desktop.

### Mobile (< 768px): barra inferior

- Substitui a barra de ações fixa atual (Despesa / Receita). Altura 64px + `env(safe-area-inset-bottom)`, `bg-surface`, `border-t border-border`.
- Cinco posições: Início, Movimentações, **+** (centro), Relatórios, Configurações. Rótulos em mono 10px caixa alta (`INÍCIO`, `MOVIMENTAÇÕES` pode encurtar para `EXTRATO` se não couber em 360px; decidir na implementação medindo, sem truncar). Ativo: `text-accent` + traço de 2px no topo; inativo `text-text-secondary`. Alvos de 44px no mínimo.
- "+" central: quadrado 48px `bg-text text-bone-50` (como o botão primário), abre um sheet de escolha com "↗ Adicionar receita" e "↘ Adicionar despesa", que leva ao formulário atual.
- O header mobile fica só com o logo (Sair vai para Configurações).
- `<nav aria-label="Principal">` nas duas versões.

### Botão "+"

- Um só componente cliente (`CreateTransaction` generalizado) montado no layout `app/(app)/layout.tsx`, não em cada página. O destaque da linha criada e o toast "Salva em {mês}" continuam; o link do toast aponta para `/movimentacoes?mes=…`.
- Desktop: o botão da sidebar abre um popover com as duas opções (teclado: setas + Enter, Esc fecha). Mobile: sheet com as duas opções.

## Fase 11 — Início

Ordem: stepper de mês, slab (sem mudanças), "Maiores gastos", "Últimas movimentações".

- **Maiores gastos** (`SectionIndex` "02"): as 3 primeiras linhas do `CategoryReport` (mesmo componente com prop `limit`), sem "Sem categoria" fora do lugar: se estiver entre as 3, aparece por último como hoje. À direita: link "Ver relatório →" para `/relatorios?mes=…`. Some sem despesas no mês.
- **Últimas movimentações** (`SectionIndex` "03"): as 5 mais recentes do mês, na tabela/lista atuais (com editar/excluir). Link "Ver todas →" para `/movimentacoes?mes=…`. Estado vazio: o atual (`EmptyState` / `MonthEmptyState`).
- Leitura: `getDashboardData(month, 5)` + `getCategoryTotals(month)`; sem query nova.

## Fase 12 — Configurações

Página `/configuracoes`, título "Configurações.", seções com `SectionIndex` (01, 02…), cada uma num card `border border-border bg-surface`.

### Categorias

- Duas listas lado a lado no desktop (Despesa | Receita), empilhadas no mobile, em ordem alfabética, com a contagem de movimentações de cada categoria (`text-text-secondary`).
- **Criar**: campo "NOVA CATEGORIA" + botão "Adicionar" no fim de cada lista. Mesmo reuso por nome da Fase 8 (nome repetido não gera erro, só não duplica).
- **Renomear**: botão "Renomear" na linha troca o nome por um `TextField` inline com "Salvar" e "Cancelar"; Enter salva, Esc cancela. Nome repetido no mesmo tipo: erro no campo "Já existe uma categoria com esse nome."
- **Excluir**: botão "Excluir" abre o `Dialog` de confirmação no padrão da exclusão de movimentação: "Excluir {categoria}? {n} movimentações ficam sem categoria." As movimentações não são apagadas (`on delete set null (category_id)`).
- Tipo da categoria não muda (mudaria o tipo das movimentações; fora de escopo).

### Perfil e senha

- **Nome**: `TextField` com o nome atual (`profiles.name`), 1 a 80 caracteres, botão "Salvar nome". Toast "NOME ATUALIZADO".
- **Email**: só leitura (trocar email exige confirmação por email; fora desta versão).
- **Senha**: "NOVA SENHA" + "CONFIRME A SENHA", mesmas regras e mensagens do cadastro (`validateNewPassword`), `supabase.auth.updateUser({ password })`. Toast "SENHA ALTERADA".
- **Sair**: botão secundário no fim da página (mesma Server Action `signOut`).

### Dados (migration `0006_settings.sql`)

```sql
-- Categorias: renomear e excluir as próprias
create policy "update own" on public.categories
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "delete own" on public.categories
  for delete to authenticated using (user_id = (select auth.uid()));
grant update (name), delete on public.categories to authenticated;

-- Perfil: editar o próprio nome
create policy "update own profile" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));
grant update (name) on public.profiles to authenticated;
```

- O `check` de 1 a 30 caracteres e o índice único `(user_id, type, lower(btrim(name)))` já valem para o rename; conflito (`23505`) vira o erro de campo acima.
- Contagem por categoria: um `select category_id, count(*)` agregado não é suportado direto pela Data API sem RPC. Usar a RPC da Fase 9 não serve (é por mês). Criar na mesma migration:

```sql
create function public.category_usage()
returns table (category_id uuid, tx_count bigint)
language sql stable security invoker set search_path = ''
as $$
  select t.category_id, count(*) from public.transactions t
  where t.category_id is not null group by t.category_id;
$$;
grant execute on function public.category_usage() to authenticated;
```

- O SQL acima foi validado no Supabase local: renomear (e `23505` ao repetir nome), excluir com movimentações (ficam sem categoria), atualizar o nome do perfil e usuário B sem efeito sobre as categorias de A. Revalidar ao aplicar na Fase 12.

## Fase 13 — Tema escuro

### Mecanismo

- Os tokens semânticos de `tokens.css` são redefinidos em `:root[data-theme="dark"]` e em `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { … } }`. As utilities do Tailwind v4 leem as variáveis, então nenhum componente muda de classe.
- Preferência em cookie `tema=claro|escuro|sistema` (padrão `sistema`), lido no `app/layout.tsx` (Server Component) para escrever `data-theme` no `<html>` já no HTML inicial: sem flash. Alterar pela seção **Aparência** de Configurações (controle segmentado CLARO | ESCURO | SISTEMA, mesmo componente do tipo na edição) via Server Action que grava o cookie.
- **Pré-requisito**: remover o uso direto de escalas nas telas, que não troca de tema. Hoje: `text-bone-50` e `hover:bg-bone-100` (`Button`), `bg-ink-500` (botão pendente), `text-ink-600` (`DeleteDialog`), `hover:text-green-900` (`TextLink`, `a:hover` em `tokens.css`). Trocar por tokens semânticos novos: `on-primary` (texto sobre botão primário/perigo), `surface-hover`, `accent-hover`, `primary-pending`, `text-body`.

### Paleta escura

Mesmos papéis, tons tirados das escalas existentes. Hex novos só onde não há tom equivalente (fundos de receita/despesa escuros). Contraste medido (WCAG): todo texto ≥ 7:1 sobre a superfície onde aparece.

| Token | Claro | Escuro | Contraste no escuro |
|---|---|---|---|
| `background` | `#f3efe5` | `#0b110e` (ink-950) | — |
| `surface` | `#fffaf0` | `#111815` (ink-900) | — |
| `surface-muted` | `#e8e1d3` | `#222d27` (ink-700) | — |
| `text` | `#17201b` | `#f3efe5` (bone-100) | 15,7 sobre surface |
| `text-secondary` | `#526058` | `#abb5ae` | 8,5 sobre surface |
| `border` | `#d2cabb` | `#344139` (ink-600) | — |
| `border-subtle` | `#e0d9cb` | `#222d27` (ink-700) | — |
| `border-strong` | `#69746d` | `#69746d` (ink-400) | 3,7 sobre surface |
| `accent` | `#183f32` | `#8ab39e` (green-300) | 7,7 sobre surface |
| `slab` | `#111815` | `#18211c` (ink-800) + borda `slab-border` | texto 14,4 |
| `income` / `income-bg` | `#2f6b4f` / `#e8f2ec` | `#a1c5b3` (green-200) / `#14352a` (green-800) | 9,6 sobre surface; 7,1 sobre o bg |
| `expense` / `expense-bg` | `#b42318` / `#f8e8e6` | `#f0b4ad` / `#3b1d1a` (novo) | 10,2 sobre surface; 8,6 sobre o bg |
| `info` / `info-bg` | `#3f624f` / `#e7eee8` | `#a1c5b3` / `#14352a` | 7,1 |
| `danger-pending` | `#8a4a44` | `#d98f87` (novo) | 7,1 sobre surface |
| `on-primary` (novo) | `#fffaf0` | `#111815` | inverte com `text` |
| `--overlay` | `rgba(23,32,27,0.4)` | `rgba(0,0,0,0.6)` | — |

Os tokens `slab-*` e `*-on-slab` ficam iguais nos dois temas: o slab já é escuro. No escuro ele se distingue do fundo pela borda `slab-border` (`#2a352e`), não por cor nova. A sombra `shadow-modal` também fica igual.

## Copy nova

| Chave | Texto |
|---|---|
| nav.label | Principal |
| nav.home | Início |
| nav.transactions | Movimentações |
| nav.transactions.short | EXTRATO (só se "MOVIMENTAÇÕES" não couber em 360px) |
| nav.reports | Relatórios |
| nav.settings | Configurações |
| nav.new | + Nova movimentação |
| nav.new.label | Adicionar movimentação (aria-label do "+") |
| home.top.title | Maiores gastos de {mês}. |
| home.top.more | Ver relatório → |
| home.recent.title | Últimas movimentações. |
| home.recent.more | Ver todas → |
| settings.title | Configurações. |
| settings.categories.title | Categorias. |
| settings.categories.expense | DESPESA |
| settings.categories.income | RECEITA |
| settings.categories.count | {n} movimentação / {n} movimentações |
| settings.categories.new | NOVA CATEGORIA |
| settings.categories.add | Adicionar |
| settings.categories.rename | Renomear |
| settings.categories.save | Salvar |
| settings.categories.delete | Excluir |
| settings.categories.error.duplicate | Já existe uma categoria com esse nome. |
| settings.categories.delete.title | Excluir {categoria}? |
| settings.categories.delete.body | {n} movimentações ficam sem categoria. / Nenhuma movimentação usa esta categoria. |
| settings.categories.toast.renamed | CATEGORIA RENOMEADA |
| settings.categories.toast.deleted | CATEGORIA EXCLUÍDA |
| settings.profile.title | Perfil. |
| settings.profile.name | NOME |
| settings.profile.email | EMAIL |
| settings.profile.save | Salvar nome |
| settings.profile.toast | NOME ATUALIZADO |
| settings.password.title | Senha. |
| settings.password.new | NOVA SENHA |
| settings.password.confirm | CONFIRME A SENHA |
| settings.password.save | Alterar senha |
| settings.password.toast | SENHA ALTERADA |
| settings.appearance.title | Aparência. |
| settings.appearance.light | CLARO |
| settings.appearance.dark | ESCURO |
| settings.appearance.system | SISTEMA |
| settings.logout | Sair da conta |

Erros de servidor reusam `tx.errorServer`. Mensagens de senha reusam as do cadastro.

## Critérios de aceite (além de `07-criterios-de-aceite.md`)

**Fase 10**
- [ ] As 4 abas navegam por rota; `aria-current="page"` na ativa; voltar do navegador funciona.
- [ ] `?mes=` preservado ao trocar de aba; `?categoria=` não atravessa abas.
- [ ] "+" abre o formulário em todas as abas (desktop e mobile); `/?novo=` e `/movimentacoes?novo=` funcionam.
- [ ] Drill-down do relatório leva a `/movimentacoes` filtrado.
- [ ] Sem rolagem horizontal em 360px; barra inferior respeita safe area e não cobre o último item da lista.

**Fase 11**
- [ ] Início com slab, top 3 e últimas 5; links "Ver…" preservam o mês.
- [ ] Mês sem despesas esconde "Maiores gastos"; conta nova mostra o estado vazio original.

**Fase 12**
- [ ] Criar, renomear (inclusive para nome existente: erro de campo) e excluir categoria; excluir mantém as movimentações como "Sem categoria".
- [ ] Nome do perfil e senha alterados; validações iguais ao cadastro.
- [ ] Usuário B não renomeia nem exclui categoria de A (testar via API).

**Fase 13**
- [ ] Claro, escuro e sistema; sem flash no primeiro carregamento em nenhum dos três.
- [ ] Nenhuma classe de escala (`bone-*`, `ink-*`, `green-*`) em componentes; só tokens semânticos.
- [ ] Contraste AA conferido em todas as telas no escuro, incluindo toasts, diálogos, skeletons e estados de erro.

**Todas**
- [ ] `tsc`, `lint` e testes verdes; screenshots 1440px e 390px das telas novas (e no escuro, na Fase 13) anexados ao PR.

## Fora desta versão

Excluir conta, trocar email, sugestão automática de categoria, "salvar e lançar outra", escolher o tipo dentro do formulário, mudar o tipo de uma categoria, reordenar categorias, cor ou ícone por categoria, relatório de receitas, comparação entre meses, exportar. Se surgir necessidade, pare e pergunte.
