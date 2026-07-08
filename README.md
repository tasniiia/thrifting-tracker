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
  icon-192.png            — PWA icon + header logo (real uploaded logo, generated at 192px)
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
  haulInsights.ts          — Commuter Offset / Time Traveler / Liquid Asset / Purchasing Power calculations
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

## Feedback round: real logo, photo picker, wear undo, and hyper-relatable metrics

- **Real logo.** The uploaded shopping-bag-and-hanger logo now replaces the
  lucide icon combo everywhere: the header and both
  PWA icons (`public/icon-192.png`, `public/icon-512.png`, regenerated
  from the source file at the correct sizes).
- **Camera vs. library, explicitly.** Tapping the photo button in "Log an
  item" now opens a small picker ("Take photo" / "Choose from library")
  instead of silently guessing — two separate file inputs behind it, one
  with `capture="environment"` for the camera, one without for the
  library.
- **Wear count can be corrected.** Both the Gallery card and the dense
  Table view now show a real +/− stepper instead of an increment-only
  button, backed by a new `removeWear` action in `ThriftContext.tsx`
  (floored at 0). An accidental tap no longer lives in the count forever.
- **BOLO is explained, not renamed.** A small info icon next to "BOLO
  wishlist" explains the acronym (Be On the Look Out) using the same
  tooltip pattern as the "Thrift I/O" name explainer, so the personality
  stays intact without leaving anyone confused.
- **Haul Flex shows the full brand and item name.** Previously anything
  over 28 characters got truncated with "…". Now brand sits on its own
  small line above the item name, and the name wraps properly (a new
  `wrapText` canvas helper) instead of cutting off. Trade-off worth
  knowing: the receipt now shows a max of 4 items instead of 6, since full
  untruncated text — sometimes wrapping to 2 lines — takes meaningfully
  more vertical space than a flat truncated line did, and the canvas has
  to stay a fixed 1080×1920 to remain a valid Instagram Story image.
  Anything beyond 4 still shows as "+N more," same as before.
- **Metrics have a "Relatable" mode.** A small "Numbers / Relatable"
  toggle on the environmental card swaps the detail line under each stat:
  - **Water** → "≈ 900 days of drinking water for one person," using a
    3 liters/day direct-drinking-water baseline (this exact example —
    2,700 liters, 900 days — is what the constant is calibrated against).
  - **CO2** → anchored to real Portland-area round-trip driving distances
    (Portland↔Salem ~94mi, Portland↔Eugene ~222mi, Portland↔Bend ~320mi,
    from averaged public driving-distance data), picked by closest
    order-of-magnitude match and expressed as either a percentage of one
    round trip or a multiple of it — e.g. "You've offset enough CO₂ to
    drive from Portland to Eugene and back." This is deliberately anchored
    to Portland specifically because that's the Sourcing Guide's existing
    coverage area, so the two features read as part of the same world
    rather than disconnected facts.
  Both live in `lib/constants.ts` (`drinkingWaterDays`, `relatableDriving`,
  `LANDMARK_ROUND_TRIPS`) as pure functions — no live API, no added cost,
  same category as the environmental-methodology work from a few rounds
  back.

## Feedback round: relatable-first metrics with real sources, and a retail price benchmark helper

- **Removed the Numbers/Relatable toggle.** The environmental card now
  leads with the human-scale framing directly — "900 days of drinking
  water," "58% of the way to a Portland to Eugene round trip" — as the
  primary bold stat. The literal figures (bathtubs, lbs of CO₂) didn't
  disappear; they moved to a smaller detail line right underneath, so
  both are visible at once with nothing to toggle.
- **Real, clickable sources**, not just a name-drop. Tapping the info icon
  on the water and CO2 stats now shows actual links at the bottom of the
  tooltip:
  - WWF's own page on a cotton t-shirt's water footprint
  - Levi Strauss & Co.'s own published jeans lifecycle assessment
    (confirms the exact figures already used for the Denim material)
  - A peer-reviewed 2024 textile fiber CO₂ study
  Each one was checked this session to make sure it's real and actually
  says what it's cited for — no placeholder or guessed URLs.
- **The CO2 stat links to a live route check.** Next to the driving
  comparison there's now a small "check this route" link straight to
  Google Maps directions for whichever landmark round trip was picked, so
  the distance is independently verifiable, not just asserted.
- **Retail price benchmark helper.** When logging an item, if you don't
  know the original retail price, three tier buttons (Fast Fashion /
  Mid-Tier / Luxury) appear under the price field — tapping one fills in
  a defensible historical ballpark for that category (e.g. Mid-Tier
  Bottoms → $90) instead of leaving the field blank or guessing. These
  are illustrative averages calibrated by category, not a single cited
  source (retail pricing varies too much by specific brand for one), and
  the field stays editable afterward. Lives in `RETAIL_TIERS` /
  `RETAIL_BASELINES` in `lib/constants.ts`.
- **On the "or use AI to guess from brand/description" alternative**: not
  built this round. It's the same tradeoff as the BOLO AI recommendations
  and the compatibility photo scan before it — a live model call needs an
  API key and costs money per use. The tier-benchmark approach above gets
  most of the practical value (a real number instead of a blank field)
  with no setup and no ongoing cost. Happy to build the AI version too if
  that tradeoff is worth it to you — just say the word.

## Feedback round: sharper logo, a real mobile tooltip fix, and top-5 Haul Flex

- **Logo sharpness.** The header was using a separately-generated 96px
  asset; it now uses the same 192px icon the PWA install icon uses,
  downscaled to display size with explicit width/height attributes for
  crisp rendering at any pixel density. Kept it in the header rather than
  removing it — branding felt worth the one extra asset — but this is an
  easy one to revisit if it still doesn't look right on your device.
- **Found and fixed the actual mobile tooltip bug**, not just a
  symptom. Every info tooltip (methodology, the "Thrift I/O" name
  explainer, the BOLO explainer) was centering itself relative to its own
  icon's position — so an icon sitting near a screen edge could still push
  a width-clamped popup partly off-screen, since clamping the *size*
  doesn't fix where it *starts*. Below the `sm` breakpoint, the tooltip
  now anchors to the viewport instead (fixed position, margins from both
  edges, safe-area-aware bottom padding, with a light tap-to-dismiss
  backdrop) — it literally cannot be cut off regardless of where the
  triggering icon lives on the page. Desktop keeps the original
  compact dropdown, since wide screens don't have this problem.
- **This is also why BOLO's tooltip looked different** — it's the exact
  same shared `InfoTooltip` component as everywhere else, just rendered
  in a narrower sidebar-column position where the cutoff bug was more
  visible. Fixing the component fixed both at once. I also normalized its
  icon size (was 11px, everything else is 12–13px) so there's no longer
  even a pixel-level difference.
- **Haul Flex shows a clean top 5, no "+N more."** Rather than truncating
  a chronological list and tacking on a leftover count, it now explicitly
  picks your top 5 items by money saved for the selected range and shows
  exactly those — reframed as "top finds & impact" rather than a partial
  list. This is arguably a better fit for a brag card anyway: a "haul
  flex" showing your 5 best deals reads better than an arbitrary first-5.



## Feedback round: real store data with addresses

The Sourcing Guide's directory was always explicitly fictional
("Bethany Vintage Exchange," "St. Johns Swap Room" — placeholder names that
sounded plausible but weren't real). It's now 8 real, verified secondhand
stores across Portland and Beaverton, looked up live rather than invented:

- **Real names, addresses, and Google Maps links** for every store —
  Second Edition Resale Shop (Bethany/Cedar Mill), Beaverton ReStore,
  Consign Couture (Multnomah Village), visii (NW 23rd), House of Vintage
  (SE Hawthorne), Village Merchants (SE Division), Broken Dreams (Alberta
  Arts), and Hound and Hare Vintage (St. Johns) — each address is now
  tappable and opens the real place in Google Maps.
- **What's real vs. what's still this app's judgment call**: the name,
  address, and place ID for each store are real and independently
  checkable. The category tags, vibe description, and price tier are this
  app's own read on each store (based on its reviews and listed type),
  not something the store published — that distinction is called out
  directly in `lib/sourcingData.ts`.
- **This is a verified snapshot, not a live feed.** Hours, inventory, and
  even whether a store is still open can change after today. The UI now
  says this explicitly instead of the old "starter directory, not a live
  business listing" framing, since it's no longer a placeholder — it's
  real data with a "verify before a special trip" caveat, which is a
  different and more honest thing to say.
- **The "Thrift Circuit" route order is now based on real coordinates** —
  a rough west-to-east/north geographic sweep — instead of an arbitrary
  sequence. Still not live-routed (no traffic, no actual optimization),
  and the UI says so, but it's no longer just made up.
- **What "live" would actually require**: genuinely real-time data (fresh
  hours, current inventory, new stores as they open) needs a live Places
  API wired into `getRecommendations`, which needs its own API key and
  has its own usage costs — the same category of tradeoff as the AI
  features earlier in this project. What's here now is the free version
  of "real": accurate at compile time, independently verifiable via the
  Maps links, just not self-updating.

## Feedback round: insights moved into the main dashboard, not the Haul Flex modal

The four insights from the previous round didn't work as an on-screen
section inside the Haul Flex modal, so they got reorganized:

- **Commuter Offset (steps) was dropped entirely** — it was redundant with
  the CO2-to-driving-distance relatable metric already in the Environmental
  Transparency card (same underlying CO2 number, two different physical
  metaphors competing for attention). `lib/haulInsights.ts` no longer
  contains this calculation at all.
- **`components/HaulInsights.tsx` (the standalone on-screen block) is
  gone.** Its contents were split up and folded directly into
  `components/Analytics.tsx`, the app's main dashboard, alongside the
  existing financial and environmental stats:
  - **Local Purchasing Power** (lattes/movie tickets, icon array) now
    lives inside the Financial Impact card, right under the existing
    stats grid — it's the same "make the raw number relatable" treatment
    already used for water and CO2, just extended to cover the dollar
    figure too.
  - **Time Traveler Span** and **Liquid Asset Score** now live together
    in a new "Closet Character" card, placed below the Carbon Footprint
    Visualizer. This card is explicitly labeled "(fun, illustrative — not
    hard data)" in its own header, keeping it visually and tonally
    distinct from the harder financial/environmental numbers above it —
    both of these are heuristics (a brand-year lookup and a resale
    multiplier), not measured facts, and the design should say so plainly
    rather than let them blend in with numbers that are actual facts.
- **Two of the four made it into the actual shareable Haul Flex receipt**,
  as real canvas-drawn text matching the receipt's existing monospace
  style — a compact two-column strip ("53 yrs of fashion history" / "12
  lattes saved") between the Environmental Wins panel and the barcode.
  **Liquid Asset Score deliberately did not** — its "rough ballpark, not a
  valuation" caveat lives in an in-app tooltip that wouldn't travel with a
  shared screenshot, and a bare "$340 resale value" with no caveat visible
  would read as a harder, more authoritative claim once it's out of this
  app's context than it actually is.
- **`Activity` icon is gone** along with Commuter Offset. `Coffee`,
  `Clock`, and `TrendingUp` are still in use (Financial Impact and Closet
  Character cards) — `Clock`/`TrendingUp` are extremely standard, `Coffee`
  still hasn't been exercised in an actual build of this project, same
  caveat as last round.

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
