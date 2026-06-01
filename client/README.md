# Portfolio Admin Client

React, TypeScript, Vite, and Tailwind frontend for the portfolio admin panel.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Source Layout

```text
src/
  app/          Application bootstrap, providers, and routes
  features/     Domain-owned pages, components, and services
  layouts/      Reusable page shells
  shared/       Cross-feature UI, hooks, and infrastructure
  assets/       Static source assets
```

Shared UI is grouped by purpose:

```text
shared/components/
  cards/        Reusable dashboard/content cards
  navigation/   Dashboard shell navigation
  ui/           Small generic UI primitives
```

Path aliases are configured in `tsconfig.app.json` and `vite.config.ts`:

```text
@app/*
@features/*
@layouts/*
@shared/*
```

Generated folders such as `dist/` and `node_modules/` are intentionally ignored by git.
