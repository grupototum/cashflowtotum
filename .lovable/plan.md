# CashFlow — Plano de Construção

Recriação do app **bulma-financas** no stack atual (TanStack Start + React 19 + Tailwind v4 + Lovable Cloud) com identidade visual **AIOX** (brutalista, zero radius, lime signature `#D1FF00` sobre canvas `#050505`, tipografia cream `#F4F4E8`).

## 1. Identidade Visual (AIOX adaptado)

- **Tema padrão**: dark cockpit (`#050505` canvas, `#0F0F11` surface, `#F4F4E8` ink). Toggle opcional para o tema light fornecido.
- **Acento**: lime `#D1FF00` exclusivo para CTAs primários, focus ring, glow de KPIs positivos.
- **Destrutivo / dívidas**: flare `#ED4609`. **Info / dados**: blue `#0099FF`. **Sucesso/receita**: lime.
- **Bordas**: hairline `rgba(156,156,156,0.15)`, **radius 0px** em tudo (cards, botões, inputs, pills).
- **Tipografia** (via Google Fonts/CDN equivalente): display `TASA Orbiter Display` (fallback `Space Grotesk`), body `Geist`, mono `Geist Mono`. Display em ALL CAPS com tracking `-0.05em`. Labels uppercase mono com prefixo `[ ]` (HUD eyebrow).
- Tudo via tokens semânticos em `src/styles.css` (oklch). Nada de cor hardcoded em componentes.

## 2. Stack & Backend

- **Lovable Cloud** ativado (Postgres + Auth + RLS).
- Auth por e-mail/senha (signup, login, recuperar senha). Perfil do usuário em `profiles`.
- Tabelas: `accounts`, `categories`, `transactions`, `budgets`, `goals`, `credit_scores`, `action_plans`. Todas com `user_id` + RLS por `auth.uid()`.
- Trigger de criação automática de profile + categorias/contas seed no primeiro login.
- Validação com Zod + react-hook-form. Datas com date-fns. Ícones lucide-react. Gráficos com Recharts (já em shadcn/chart).

## 3. Estrutura de Rotas (TanStack)

```text
src/routes/
  __root.tsx              shell HTML + providers (theme, query)
  index.tsx               landing/login (público)
  recuperar-senha.tsx
  app.tsx                 layout autenticado (sidebar + topbar HUD)
  app.dashboard.tsx       KPIs, gráfico receitas×despesas, últimas transações
  app.transactions.tsx    CRUD + filtros (mês, conta, categoria, tipo)
  app.categories.tsx      CRUD categorias (emoji + cor)
  app.contas.tsx          CRUD contas/cartões
  app.orcamentos.tsx      orçamentos mensais por categoria + barra de progresso
  app.metas.tsx           metas com progresso
  app.relatorios.tsx      gráficos (pizza por categoria, linha mensal, top gastos)
  app.plano.tsx           score Serasa + ações de quitação
  app.perfil.tsx          dados do usuário + logout
```

Cada rota com `head()` próprio (title/description/og). Rota `app.*` protege via `beforeLoad` checando sessão.

## 4. Componentes-chave (estética AIOX)

- **HudEyebrow** — label mono uppercase com `[ PREFIX ]`.
- **BrutalistCard** — surface tier, hairline border, zero shadow, zero radius.
- **KpiTile** — número grande em display, delta colorido (lime/flare), sparkline opcional.
- **LimeButton** — CTA primário lime com glow no focus; variantes ghost/outline hairline.
- **HairlineInput / Select / Textarea** — bordas 1px, foco com ring lime.
- **DataTable brutalista** — header mono uppercase, linhas com hairline, hover lime sutil.
- **Sidebar cockpit** — fixa à esquerda no desktop, drawer no mobile, item ativo com barra lime à esquerda.
- **TopBar HUD** — breadcrumb + filtro de mês/ano global + avatar.
- **EmptyState brutalista** — bracket art + CTA lime.

## 5. Telas — escopo de UX

### Login (`/`)
Hero brutalista split-screen: à esquerda manifesto ("CONTROLE TOTAL DO SEU FLUXO"), à direita card de login hairline. Link p/ signup e recuperar senha. Sem imagem da Bulma — substituído por composição tipográfica + grid HUD.

### Dashboard (`/app/dashboard`)
- 4 KPI tiles: Saldo, Receitas do mês, Despesas do mês, Resultado.
- Gráfico de barras receitas×despesas (últimos 6 meses).
- Donut por categoria.
- Lista das últimas 8 transações com ações rápidas.
- Filtro global de mês/ano no topo.

### Transações (`/app/transactions`)
- Tabela com filtros (busca, tipo, conta, categoria, intervalo).
- Modal de criar/editar com auto-categorização por palavra-chave (porta de `lib/auto-categorization.ts`).
- Bulk delete, paginação.

### Categorias / Contas
- Grid de cards brutalistas com emoji/ícone, cor de acento, totais agregados.
- Modal CRUD.

### Orçamentos
- Por categoria/mês: barra de progresso com cor (lime → flare conforme % consumido).

### Metas
- Cards com valor alvo, progresso, prazo, anotações.

### Relatórios
- Tabs: Visão Geral, Por Categoria, Tendências.
- Charts: linha de saldo acumulado, pizza categorias, top 10 gastos, comparativo mês a mês.

### Plano de Ação
- Header com score atual (gauge), histórico em linha.
- Lista de dívidas (flare) com status, valor, credor, vencimento.
- Checklist de ações com data e status (pendente/feito).

### Perfil
- Form de nome/avatar, troca de senha, logout.

## 6. Melhorias de UX/UI sobre o original

- Tema dark cockpit nativo + toggle light.
- Comando global `Cmd+K` para navegar e criar transação rápida.
- Auto-categorização sugerida em tempo real ao digitar a descrição.
- Filtro de mês/ano persistente (URL search params) compartilhado entre telas.
- Skeleton loaders brutalistas (blocos hairline animados).
- Toasts (sonner) com estilo HUD.
- Atalhos: `N` nova transação, `/` busca.
- Formatação BRL coerente, datas em pt-BR.
- Vazios com ASCII brackets + CTA — nunca tela em branco.
- Acessibilidade: foco lime visível, contraste AA garantido nas duas paletas.

## 7. Entrega faseada

1. **Fundação**: tokens AIOX em `styles.css`, fontes, layout shell, rota raiz, ativação do Lovable Cloud, schema + RLS, auth (login/signup/recuperar).
2. **Core**: contas, categorias, transações com CRUD + auto-categorização + filtros + dashboard com KPIs e charts.
3. **Avançado**: orçamentos, metas, relatórios, plano de ação + score, perfil, command palette, polimento e empty states.

Ao final de cada fase o app fica utilizável; aprovando o plano, começo pela Fase 1.
