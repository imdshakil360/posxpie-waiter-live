# POSxPie Waiter Live — Cashier POS Demo

A React 18 + TypeScript + Vite 6 single-page Point of Sale (cashier) app, styled with
Tailwind CSS v4 and HeroUI. Imported from the shared Google Drive "waiter" folder.

## Features

- PIN pad sign-in for cashiers
- Sell / basket workspace with menu, modifiers and quantities
- Orders workspace with order panel and status management
- Payment flow, My Shift summary, multilingual labels (English / Bangla)
- Offline / printer toggles and queued-order flushing
- Local demo data seeded from `src/data/seed.ts` (no backend needed)

## Run locally

```bash
npm ci
npm run dev      # http://localhost:5173  (binds 0.0.0.0 for previews)
npm run build    # production output in dist/
npm run preview  # serve the production build
```

## Demo login

| PIN | Role | Language |
| --- | --- | --- |
| `1111` | Manager | English |
| `2222` | Cashier | Bangla |
| `3333` | Cashier | English |

Shortcuts: `F1` Sell, `F2` Orders, `F3` My shift, `F9` Charge, `/` Search menu.

## Structure

```
index.html
vite.config.ts / tsconfig.json / vercel.json
src/
  main.tsx, App.tsx, store.tsx, styles.css, hero.ts
  screens/    Sell, Basket, Payment, Orders, MyShift, PinPad
  components/ OrderPanel, modals, ui
  lib/        types, i18n, money
  data/       seed
docs/         prebuilt static site (relative asset paths) for GitHub Pages
```

## Deployment

- **Vercel**: auto-detected as Vite (`npm run build` → `dist`). `vercel.json` pins the
  framework, build command, output directory and SPA fallback.
- **GitHub Pages**: serve the prebuilt `docs/` folder; asset URLs are relative
  (`base: "./"`) so subpaths work. Rebuild it with
  `npm run build && cp -R dist/. docs/ && touch docs/.nojekyll`.
