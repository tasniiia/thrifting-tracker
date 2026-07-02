# Thrift I/O

A thrift-inventory platform: ledger + photos, cost-per-wear, financial and
environmental analytics with a carbon-milestone visualizer, an AI-flavored
sourcing guide with route optimization, a mock compatibility checker,
donation archiving, one-click reseller listings, and a "Haul Flex"
shareable receipt card.

**This is now a complete, standalone Next.js project** — every config file,
the root layout, and the global stylesheet are included. If you were
previously copying individual files into another project, stop doing that
and just use this folder directly; the earlier missing `app/layout.tsx`
and `app/globals.css` were the reason styling wasn't loading.

## Quickstart

```
npm install
npm run dev
```

Open `http://localhost:3000`. That's it — no other setup required.

## Full file structure

```
package.json              — dependencies (next, react, lucide-react, tailwindcss)
next.config.js            — minimal Next.js config
tsconfig.json             — TypeScript config
postcss.config.js         — wires up Tailwind + Autoprefixer
tailwind.config.ts        — content paths covering app/, components/, lib/
next-env.d.ts             — Next.js TS environment types
.gitignore

app/
  layout.tsx              — root layout; imports globals.css (this is what loads Tailwind)
  globals.css             — @tailwind base/components/utilities directives
  page.tsx                — dashboard composition, responsive layout, hydration/error guards

components/
  ErrorBoundary.tsx        — catches render errors per-widget
  ItemFormModal.tsx        — shared add/edit form (name, brand, category, prices, photo, notes)
  Ledger.tsx               — Gallery/Table view toggle, sort/filter, wear tracking, Generate Listing, Donate, edit/delete
  Analytics.tsx            — financial stats + environmental transparency + carbon footprint visualizer
  SourcingGuide.tsx        — store recommendations + route-optimization "Thrift Circuit"
  CompatibilityCheck.tsx   — mock AI compatibility scoring modal with a match-score ring
  Bolo.tsx                 — wishlist ("white whale") list + "Found it!" → adds to ledger
  HaulReceipt.tsx          — canvas-rendered, receipt-styled share card (1080×1920 PNG)
  WelcomeBanner.tsx        — onboarding hero shown when the closet is empty
  EmptyState.tsx           — reusable icon + heading + CTA block for empty lists
  EcoFactStrip.tsx         — small ambient eco-fact pill under the header

lib/
  types.ts                 — ThriftItem (incl. status) / BoloItem / Store types
  constants.ts             — impact factors, CO2 tiers, compatibility map, storage keys, tooltip copy
  storage.ts               — localStorage wrapper that never throws
  image.ts                 — client-side photo compression before storage
  listing.ts               — reseller listing text builder + clipboard copy
  compatibility.ts         — mock compatibility scoring logic
  sourcingData.ts          — starter store directory, recommendations, route builder
  ThriftContext.tsx        — global state, CRUD + donate actions, derived stats (React Context)
  Toast.tsx                — lightweight toast notification provider
```

## Why the styling broke before

Every file above the `app/` and root-config level was correct on its own,
but a Next.js App Router project has two files that are easy to forget
because nothing errors loudly when they're missing in certain setups:

- **`app/layout.tsx`** — the root layout every page renders inside of.
- **`app/globals.css`** — holds the `@tailwind base/components/utilities`
  directives. Without this file imported into the layout, Tailwind's CSS
  never gets generated at all, even though every class name in the JSX is
  perfectly correct — which is exactly why the page rendered with all its
  content but zero styling.

Both are included now, and `layout.tsx` imports `globals.css` directly.

## Design & implementation notes

- **Palette**: cream (`#F4F1E8`) background, sage/olive ink (`#2B2A22`,
  `#333829`, `#4F5B3E`) for structure and positive numbers, stone
  (`#A9A290`) for borders and muted text, clay (`#B5714B`) as the warm
  accent for savings totals and CTAs.
- **Type**: `Fraunces` (serif, display) for headlines, `DM Sans` for body
  copy, `Space Mono` for every number, stat, and the "I/O" logotype.
- **Dynamic classes are Tailwind-safe.** Every conditional `className`
  uses fully-written ternary strings, never string-interpolated fragments.
  Category/tier colors and the one complex gradient (in `EmptyState.tsx`)
  are applied via inline `style`, not arbitrary Tailwind values — this
  avoids both class-purging issues and PostCSS parse failures on complex
  arbitrary values.
- **Donation accounting.** Donated items leave the active Ledger/Gallery
  and the Haul Flex share card, but still count toward lifetime financial
  and environmental totals in Analytics.
- **Compatibility scoring and route optimization are deterministic mocks**,
  not live model/API calls — both say so directly in code comments and UI
  copy.
- **Photos and storage limits.** Photos are compressed client-side
  (`lib/image.ts`) and stored as base64 in `localStorage` (~5–10MB cap,
  roughly 100–250 photos). Swap for S3/Vercel Blob/Supabase for heavier use.
- **Environmental figures are estimates** — public averages sized to
  communicate scale, not an audited footprint, and labeled as such in the
  Analytics info-tooltips.
- **Error boundaries are per-section**, so one broken widget shows a
  "try again" card instead of taking down the whole dashboard.
- **Hydration guard**: state loads inside a `useEffect` (client-only) and
  the dashboard renders a skeleton until that finishes, avoiding SSR/CSR
  mismatch crashes.

## If you still see unstyled output after this

1. Delete any previous partial project and use this folder as-is — don't
   merge it into another directory.
2. `rm -rf node_modules .next && npm install && npm run dev` for a fully
   clean install.
3. If `npm run dev` prints any error in the terminal, that message is the
   fastest way to diagnose anything further — paste it back for help.
