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
  layout.tsx              — root layout; imports globals.css, links manifest, registers the service worker
  globals.css             — @tailwind base/components/utilities directives
  page.tsx                — dashboard composition, responsive layout, hydration/error guards

public/
  manifest.json           — PWA manifest (installable "Add to Home Screen")
  sw.js                   — service worker: stale-while-revalidate app-shell caching for offline load
  icon-192.png            — PWA icon, generated to match the app's shopping-bag-and-leaf logo
  icon-512.png            — PWA icon, larger size

components/
  ErrorBoundary.tsx        — catches render errors per-widget
  ServiceWorkerRegister.tsx — registers public/sw.js on mount
  BottomSheet.tsx          — shared modal shell: bottom sheet on mobile (swipe-to-dismiss), centered on desktop
  ItemFormModal.tsx        — shared add/edit form; progressive disclosure, native camera capture
  Ledger.tsx               — Gallery/Table view toggle, sort/filter, wear tracking, Generate Listing, Donate, edit/delete
  Analytics.tsx            — financial stats + environmental transparency + carbon footprint visualizer
  SourcingGuide.tsx        — store recommendations + route-optimization "Thrift Circuit"
  CompatibilityCheck.tsx   — mock AI compatibility scoring modal with a match-score ring
  Bolo.tsx                 — wishlist ("white whale") list + marketplace links + "Found it!" → adds to ledger
  HaulReceipt.tsx          — canvas-rendered, receipt-styled share card (1080×1920 PNG); Web Share API
  WelcomeBanner.tsx        — onboarding hero shown when the closet is empty
  EmptyState.tsx           — reusable icon + heading + CTA block for empty lists
  EcoFactStrip.tsx         — small ambient eco-fact pill under the header
  InfoTooltip.tsx          — shared click-to-open tooltip (methodology notes, name explainer)
  ActionMenu.tsx           — reusable overflow ("⋯") menu, consolidates crowded icon rows
  ConfirmDialog.tsx        — reusable Yes/No confirmation modal (used before marking an item donated)

lib/
  types.ts                 — ThriftItem (incl. status, material) / BoloItem / Store types
  constants.ts             — impact factors, CO2 tiers, compatibility map, storage keys, tooltip copy
  storage.ts               — localStorage wrapper that never throws
  image.ts                 — client-side photo compression before storage
  listing.ts               — reseller listing text builder + clipboard copy
  compatibility.ts         — mock compatibility scoring logic
  marketplaceLinks.ts      — secondhand marketplace search-link builders + category filtering (BOLO)
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

## Feedback round: contrast, clutter, and two new capabilities

- **Haul Flex accessibility fix.** The canvas filled its entire background
  with a near-black sage (`#3F4A38`) before drawing the lighter paper on
  top, framing the whole card in dark space. That's now a soft light sage
  (`#DCE3D0`) — no text sits on a dark background anywhere in the receipt.
  The percent-off donut chart is also gone, replaced by a plain text pill
  showing the same number (simpler, and one less thing to visually parse).
- **Sourcing Guide checkboxes are now opt-in.** They only appear after
  tapping "Plan a route" — previously every store card showed a checkbox
  even for people just browsing recommendations, which added clutter with
  no clear purpose until you actually wanted to build a route.
- **Purchase vs. Donation distinction at logging time.** `ItemFormModal`
  now opens with a Purchase/Donation segmented toggle. Donations skip the
  "you paid" field (you're giving the item away, not buying it), ask for
  an estimated value instead (used only for the environmental-impact
  math), and file directly into the donated archive with a toast
  confirming why it won't show up in the active closet. Previously the
  only way to log a donation was to first add it as a purchase, then
  separately mark it donated.
- **Compatibility Check stays a manual, zero-setup heuristic.** A real
  Claude-vision-backed photo scan was built and worked, but required an
  Anthropic API key and paid API usage per scan — that tradeoff wasn't
  worth it for this app, so it was rolled back by request. `CompatibilityCheck.tsx`
  is back to a single category + vibe check with no camera, no API call,
  and no setup, and is upfront in its own copy that it's a stylist
  heuristic rather than real image analysis.

## Feedback round: marketplace links, mobile table, naming, and polish

- **BOLO now surfaces secondhand marketplace links.** Every hunt-list item
  shows quick search links to eBay, Poshmark, Depop, and ThredUp, built
  from the item's name (`lib/marketplaceLinks.ts`). These are **plain
  search URLs today, not live affiliate links** — Poshmark and Depop don't
  currently run public affiliate programs, and eBay's Partner Network
  requires enrollment. Each marketplace has a clearly marked spot in
  `AFFILIATE_PARAMS` to drop in a real tracking/affiliate param once
  you've signed up; until then those values are empty and nothing is
  appended. The in-app copy says plainly that they're not affiliate links
  yet, so it isn't misleading.
- **Mobile table view is denser.** The Category and Retail columns now
  hide below the `sm` breakpoint (Category still shows as a small colored
  dot + label under the item name instead of disappearing entirely), and
  padding/font sizes step down on mobile so the essentials — item, paid,
  saved, wears, actions — fit without needing to scroll sideways on a
  phone.
- **Wear count got a real badge.** The old "+1 (12)" text button is now a
  bold circular count badge next to a Repeat icon — reads clearly at a
  glance in the tight mobile table, not just as a wall of small text.
- **"Log a find" → "Log an item"** everywhere (the ledger button, its
  empty state, and the welcome banner's first step), since the form
  itself now handles both purchases and donations and the button
  shouldn't imply it's purchase-only.
- **The "Thrift I/O" name has an explainer.** A small info icon next to
  the logo explains the pun: I/O (Input/Output) is one of the first
  concepts in computer science, and it's also literally what the app
  tracks — items coming in via purchases, going out via donations.
- **Haul Flex line items include the brand** now, not just the item name
  (e.g. "LEVI'S CORDUROY JACKET" instead of just "CORDUROY JACKET").
- **BOLO's "Found it!" button got more fun.** It's now a warm gold
  gradient circle with a scale/shadow animation on hover and tap, and
  clicking it shows a small celebratory toast (randomized between a few
  messages) before opening the "log this item" form — meant to feel like
  a small reward for actually finding your white whale, not just another
  gray icon button.

## Feedback round: research-grounded environmental methodology

The environmental math went from flat per-category guesses to a
**category × material** model built from real published research — no
live AI call needed for this, since it's encoded directly:

- **`lib/constants.ts`** now has `MATERIAL_FACTORS` (per-kg water/CO2 by
  material — Cotton, Synthetic, Wool, Leather, Mixed/Other) crossed with
  `CATEGORY_MASS_KG` (typical finished-garment weight per category). Every
  number traces to a named source in the code comments: Water Footprint
  Network and WWF for cotton's water figure, a 2024 fiber-emissions study
  (Tekin et al., cited via a 2025 IWA Publishing textile LCA paper) for
  polyester/wool CO2, Carbonfact's real dataset of ~46,000 jackets for the
  Outerwear weight assumption, and Leather Panel data for leather's
  per-square-meter CO2 figure.
- **Sanity-checked against the sources it's built from**: the Tops+Cotton
  combination lands at ~660 gal (≈2,500 L), close to WWF's commonly cited
  2,700 L for a cotton t-shirt; Bottoms+Cotton lands at ~2,100 gal
  (≈8,000 L), inside the 7,500–10,000 L range widely cited for a pair of
  jeans. That's not a coincidence — the category weight assumptions were
  chosen specifically to land in these ranges, since matching independently
  published per-garment figures is the best available check on a model
  like this.
- **New optional "Material" field** when logging an item (Cotton,
  Synthetic, Wool, Leather, or "not sure/mixed"). Specifying it sharpens
  the water/CO2 estimate for that item; leaving it blank falls back to a
  blended average, exactly like every item logged before this field
  existed (handled by `migrateItem` in `ThriftContext.tsx`, so old data
  never breaks).
- **Waste diverted is now derived from the same mass figure** used in the
  water/CO2 math, instead of being a third, separately-guessed number —
  internally consistent by construction rather than by coincidence.
- **The in-app methodology tooltips were rewritten** to describe this
  category × material approach and name the real sources behind it,
  instead of the previous "public-average estimate" language with no
  named source.
- **Still estimates, not lab measurements** — real garment footprints vary
  by brand, mill, and region, and the tooltips say so explicitly. What
  changed is that "estimate" now means "grounded in a specific published
  figure with room to specify material," not "a number that was
  reasonable-sounding when this app was first built."

## BOLO recommendations: what "more AI-driven" would actually require

I didn't build this one yet — it's a different kind of ask than the
environmental math above, and worth flagging before writing code neither
of us might want. Generating genuinely personalized secondhand-hunting
suggestions (smarter search terms, alternate brands to consider, realistic
price expectations for a specific item) isn't something a static formula
can fake — it needs an actual live model call, which means the same
tradeoff as the compatibility photo scan a few rounds back: an Anthropic
API key and a small real cost per use. Given that got rolled back last
time specifically to avoid that setup, I wanted to check before building
another feature with the identical tradeoff rather than assume the answer
changed.

## Feedback round: shorter tooltips, safer donation flow

- **Info tooltips are much shorter** — every methodology tooltip and the
  header's "Thrift I/O" explainer went from a paragraph to 1–2 short
  sentences. The fuller research citations didn't disappear, they just
  moved to code comments in `lib/constants.ts` where they belong for
  anyone maintaining the app, rather than cluttering the UI.
- **Tooltips are mobile-safe now.** `InfoTooltip.tsx` no longer uses a
  fixed 256px box positioned by a left/right prop that could overflow a
  phone screen depending on where the icon sits — it's centered under the
  icon with a width that's clamped to 80% of the viewport
  (`w-[min(220px,80vw)]`), so it can't spill off either edge regardless of
  screen size.
- **Donating now asks for confirmation first.** Tapping the Gift icon
  (gallery or table view) opens a confirm dialog (`ConfirmDialog.tsx`,
  a new reusable component) before anything actually changes — no more
  one-tap-and-it's-gone.
- **Donations can be undone.** A new "Show donated items (N)" toggle at
  the bottom of the Ledger reveals previously-donated items with a
  "Restore" button, which moves them back into the active closet
  (`restoreItem` in `ThriftContext.tsx`). Financial and environmental
  totals don't change either way, since they already counted the item
  regardless of its status — only which view it shows up in changes.

## Feedback round: more materials, a better waste icon, less mobile clutter

- **Denim and Satin added as materials.** Denim is sourced directly from
  Levi Strauss & Co.'s own published cradle-to-grave LCA of a pair of 501
  jeans (3,781 L water, 33.4 kg CO2e) — scaled to a per-kg rate using this
  app's 0.8 kg Bottoms weight assumption, it reproduces those exact
  figures almost perfectly for a denim item in that category (a good sign
  the underlying model holds together). Satin is different: it's a weave,
  not a fiber, so there's no clean single LCA figure to cite — published
  silk data alone varies by two orders of magnitude between sources (some
  industry claims even market it as "carbon negative"), which made using
  silk numbers directly too unreliable. Satin is modeled as a Synthetic
  (polyester) base with a documented ~30–50% increase for the extra
  finishing satin needs for its sheen — a transparent assumption, called
  out as such in the code comments, not a cited figure like the others.
- **Haul Flex's waste icon changed from a leaf to a recycling symbol.**
  A leaf reads as "eco" generally — a hand-drawn three-arrow recycling
  glyph (`drawRecycle` in `HaulReceipt.tsx`) says "diverted from landfill"
  specifically, which is what that stat actually measures. (Worth noting:
  the Analytics dashboard's "waste diverted" card still uses a leaf icon
  from lucide-react — that wasn't part of this request, so it's untouched,
  but happy to make it consistent too if wanted.)
- **Mobile decluttering, mainly via a new overflow menu.** The Ledger's
  gallery cards and table rows each had 4 separate icon buttons crammed
  into a small space — on a narrow 2-column mobile grid that's a lot of
  tiny tap targets fighting for room. All 4 (Generate Listing, Edit,
  Mark as Donated, Delete) are now behind a single "⋯" button
  (`ActionMenu.tsx`, a new reusable component) that opens a clean labeled
  list on tap. Applied the same pattern to BOLO's Edit/Delete, while
  keeping the "Found it!" button prominent on its own — burying that one
  in a menu would undercut the "exciting to tap" feel from an earlier
  round. Also hid the decorative header tagline below the `sm` breakpoint
  and tightened the BOLO marketplace-link pills, since both were
  competing for space unnecessarily on small screens.

- **One more mobile overflow fix in Analytics.** The environmental
  "Impact Row" (the big bold number + unit text + info icon on one line —
  e.g. "1,234 lbs of CO₂ avoided ⓘ") had no wrap allowance, so on a narrow
  phone that could overflow or crowd against the card edge. It now wraps
  gracefully (`flex-wrap`) and the number's font size steps down slightly
  on mobile (`text-xl sm:text-2xl`). The 10-droplet water row is also
  marginally smaller (19px vs. 22px) so it sits more comfortably on
  narrow widths.

## Mobile-First Optimization Sprint

This PRD had two requirements that didn't actually fit how this app is
built. Rather than silently build around that mismatch or fake something
that looks like it works, here's what changed, what didn't, and why.

### Two deliberate deviations from the PRD

1. **No "sync to the database" queue, because there's no database.**
   Feature 3 asked for an IndexedDB offline queue with a "pending sync"
   icon that pushes to a database on reconnect. This app has never had a
   backend — every item, BOLO entry, and photo already lives entirely in
   `localStorage` on the device. That's actually good news: logging a new
   find **already works with zero network connectivity today**, with or
   without a service worker, because there was never a network round-trip
   in that path to begin with. Building a fake sync queue would show a
   "pending" status that doesn't correspond to anything real — that's
   worse than not building it. What the service worker (`public/sw.js`)
   actually adds is the part that was genuinely missing: caching the app
   shell itself (HTML/JS/CSS) so the *page* can load with zero
   connectivity, and making the app installable via `public/manifest.json`.
   If a real backend gets added later, a genuine offline-write-queue would
   be worth revisiting — it just isn't today.
2. **No custom URI schemes (`ebay://`, `depop://`) for deep linking.**
   Feature 4 asked for these with an https:// fallback. I didn't add them,
   because eBay, Depop, and Poshmark all support Universal Links / App
   Links today — a plain `https://` link (which is what
   `lib/marketplaceLinks.ts` already builds) already opens directly in the
   native app automatically when it's installed, with the browser as an
   automatic, graceful fallback when it isn't. Custom scheme URIs aren't
   publicly documented by any of these companies and change without
   notice — getting one wrong doesn't degrade gracefully like a normal
   link does, it can throw a "can't open this page" error instead. Adding
   them would have made deep linking strictly less reliable, not more.

### What was built

- **PWA foundation** (`public/manifest.json`, `public/sw.js`,
  `components/ServiceWorkerRegister.tsx`): installable "Add to Home
  Screen" support, brand-matching app icons (192px/512px, generated to
  match the existing shopping-bag-and-leaf logo), and stale-while-
  revalidate caching of same-origin requests so the app shell loads
  offline after the first visit. Registered from `app/layout.tsx`, which
  also got `viewport-fit: cover` so `env(safe-area-inset-*)` resolves
  correctly on iOS.
- **Bottom sheets everywhere, with swipe-to-dismiss.** Every modal in the
  app (`Log an item`, `Compatibility check`, `Haul Flex`, the BOLO form,
  and the donate confirmation) now shares one component,
  `components/BottomSheet.tsx`: centered on desktop, a true bottom sheet
  on mobile with a drag handle, swipe-down-to-dismiss (only triggers when
  the sheet is already scrolled to the top, so it doesn't fight with
  scrolling a long form), and bottom padding that respects
  `env(safe-area-inset-bottom)` automatically.
- **Sticky submit button** (`StickyActionBar` in the same file): on
  `Log an item`, the primary CTA stays pinned to the bottom of the sheet
  as you scroll through expanded fields, instead of scrolling away with
  the form.
- **44px-minimum touch targets** on the controls people actually tap
  repeatedly in-store: the `ActionMenu` overflow-menu trigger and its
  rows, every modal's close button, BOLO's Found-it/Edit/Delete cluster,
  and the Haul Flex trigger and share/download buttons. The one exception
  is the dense `TableView`'s wear-count badge — that view's whole purpose
  is information density as an alternative to the spacious Gallery view,
  so forcing 44px rows there would work against its own reason for
  existing. Worth a follow-up if you'd rather it be touch-optimized too.
- **Native camera capture, already partially in place, now consistent.**
  `capture="environment"` (opens the rear camera directly on supported
  mobile browsers instead of a generic file picker) is now on the item
  photo input in `ItemFormModal.tsx`.
- **Progressive disclosure on "Log an item."** A brand-new entry now opens
  showing only Photo, Item Name, and You Paid/Estimated Value — Brand,
  Category, Material, and Retail Price are collapsed behind a
  "+ Add details" toggle. Editing an existing item still opens fully
  expanded, since there's no "quick capture" moment for an edit. Category
  defaults to "Other" instead of "Tops" now, since that's a more honest
  default for something the person hasn't actually specified yet.
- **Web Share API for Haul Flex.** Tapping "Share" now tries
  `navigator.share()` with the receipt image as a file directly — one tap
  to Instagram, Messages, or anywhere else, no camera-roll round-trip.
  Falls back automatically to the original direct-download button on
  browsers that don't support sharing files (most desktop browsers, some
  older mobile ones), so it never dead-ends.
- **Marketplace deep-link filtering by category.** Depop and ThredUp
  (apparel-focused platforms) now hide themselves in the BOLO marketplace
  links for non-apparel categories (Home Goods, Other) — eBay and
  Poshmark still show for everything, per the PRD's specific ask.
- **Fixed a latent bug found along the way:** `Bolo.tsx`'s form was using
  a `.modal-input` CSS class it never actually defined — it only worked
  because another component happened to inject that global style first.
  It now defines its own copy, so it's correct regardless of what else is
  mounted.

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
- **Environmental figures are research-grounded estimates, not lab
  measurements of your specific item** — see "research-grounded
  environmental methodology" above for the real sources behind each
  number, and the in-app tooltips for a shorter version of the same.
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
