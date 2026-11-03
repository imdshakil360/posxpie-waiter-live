# POSxPie Waiter Live — Cashier POS Demo

A React + TypeScript + Vite single-page Point of Sale (cashier) app, styled with
Tailwind CSS v4 and HeroUI. Imported from the Google Drive "waiter" folder.

## Features
- PIN pad sign-in for cashiers
- Sell / basket workspace with menu, modifiers and quantities
- Orders workspace with order panel and status management
- Payment flow, My Shift summary, multilingual labels (i18n)
- Local demo data seeded from `src/data/seed.ts`

## Run locally
```bash
npm ci
npm run dev      # http://localhost:5173
npm run build    # production output in dist/
npm run preview
```

## Deployment
`npm run build` produces a static site in `dist/`, suitable for Vercel or any
static host. The Vite config binds to `0.0.0.0` for container/preview use.
