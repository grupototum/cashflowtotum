
## Fase 2 — Polimento brutalista + fonte Helvetica

### 1. Tipografia (global)
Em `src/styles.css`:
- Trocar `--font-sans` para `"Helvetica Neue", Helvetica, Arial, sans-serif` (stack nativa, sem download).
- Manter `--font-display` em Space Grotesk (display ALL CAPS -0.05em conforme AIOX) e `--font-mono` em Geist Mono para HUD labels.
- Opcional: aplicar `font-stretch` e tracking sutil no body para reforçar o tom técnico.

### 2. Dashboard (`app.dashboard.tsx`)
- Header HUD com eyebrow `[ COCKPIT ]` + título display + filtro de mês/ano (chevrons consistentes com Orçamentos).
- Grid de 4 KpiTiles (Saldo, Receitas, Despesas, Taxa de poupança) com tone lime/flare/info e delta vs mês anterior.
- Bloco "FLUXO" — `BrutalCard` envolvendo AreaChart Recharts (linhas finas, fill lime translúcido, grid hairline `var(--border)`, tooltip preto sólido com borda lime).
- Bloco "DESPESAS POR CATEGORIA" — barras horizontais brutalistas (sem radius, cor `var(--primary)` / `var(--flare)` quando estoura orçamento).
- Lateral direita: lista "ÚLTIMAS TRANSAÇÕES" com linhas hairline, mono tabular nums.
- Overlay scanline sutil no header e grid-bg no fundo do card de flux.

### 3. Transações (`app.transactions.tsx`)
- Toolbar superior: HudLabel `[ OPERAÇÕES ]`, busca com borda hairline + ícone, filtros (tipo, categoria, conta, intervalo de datas) como chips retangulares toggláveis.
- Tabela densa estilo cockpit: cabeçalho mono uppercase, linhas com hover lime, valores tabulares, badge brutalista para tipo (income lime / expense flare / transfer info).
- Bulk-select com checkbox quadrado + barra de ação inferior fixa para excluir/recategorizar.
- Modal de nova/editar transação refeito com mesmo padrão de `BudgetModal` (header display + HUD labels + botão lime).
- Empty state HUD `[ NENHUMA TRANSAÇÃO ]`.

### 4. Orçamentos (`app.orcamentos.tsx`)
- Manter estrutura, adicionar:
  - KPI strip no topo (TOTAL ORÇADO / TOTAL GASTO / RESTANTE) usando `KpiTile`.
  - Cards de orçamento: progress bar com marcações (segmentos a cada 25%), badge `OVER` quando estoura, tooltip mostrando transações que compõem o gasto.
  - Ordenação por % usado desc.
  - Modal: validar duplicidade, sugerir valor baseado na média dos últimos 3 meses.

### 5. Componentes compartilhados
- Novo `src/components/brutal-button.tsx` (variants: lime, ghost-border, flare) para padronizar CTAs.
- Novo `src/components/brutal-input.tsx` e `brutal-select.tsx` com borda hairline + focus ring lime.
- Novo `src/components/hud-divider.tsx` (linha + bracket lateral) para separadores de seção.
- `src/components/empty-state.tsx` reutilizável no padrão `[ ... ]`.

### Notas técnicas
- Sem alterações de schema/backend.
- Recharts: forçar `stroke-width: 1` e cores via tokens (`var(--primary)`, `var(--info)`, `var(--flare)`).
- Tudo via tokens semânticos do `styles.css` — nenhum hex hardcoded em componentes.
- Mobile: KPIs viram 2x2, tabela de transações vira lista de cards.
