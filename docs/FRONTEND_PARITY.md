# Frontend parity contract

The frontend modernization preserves the current user experience. Existing routes,
API methods and envelopes, saved document shapes, calculations, labels, control
order, focus behavior, responsive layout, and report downloads are compatibility
requirements.

## Visual baseline

`client/e2e/visual-parity.spec.ts` captures every appraisal workflow at 1440×900
and 390×844, plus representative expanded navigation, comparable, and calculation
states. Baselines are generated from the pre-refactor seeded Docker application.

Snapshot changes must not be accepted solely to make CI pass. An intentional
change requires before/after images and a written explanation showing that it is
limited to incidental alignment, rendering, warning-free markup, or accessibility
focus visibility and does not alter the workflow or information hierarchy.

### 2026-08-30 baseline repair

The first checked-in set contained 18 invalid mobile images: their expected image was
the transient `Loading appraisal…` shell, even though the visual test now waits
for the loaded workspace. Those images cannot detect a production visual
regression and were replaced with reviewed, fully-loaded captures from the same
seeded local API. The harness now explicitly rejects loading and unavailable
states before a screenshot is taken.

The comparable-map fallback embeds live OpenStreetMap tiles. Its external tile
content is intentionally replaced with a local neutral map surface *only for
visual capture*, so that layout and controls remain covered without accepting
unrelated tile-label or road-rendering changes. Cross-browser functional tests
continue to exercise the real fallback iframe and map controls.

## Functional baseline

`client/e2e/local-demo.spec.js` is the cross-browser workflow contract. Refactors
must retain route behavior, visible controls and labels, interaction order, focus
destinations, feedback, request payloads, and persisted results after reload.

Unrelated behavior fixes are kept out of modernization changes and handled as
separate, explicitly reviewed work.

### Recorded legacy behavior

- `ViewFinancialStatementAudit` initializes inclusion flags and calculates totals
  from `extractedData.income` and `extractedData.expense`, but its detail tables
  read the legacy `items` group and therefore do not render those extracted rows.
  This mismatch is characterized and preserved during modernization. Any repair
  must be a separately reviewed behavior change.
- `MarketRentDifferentialForUnitCalculationPopoverWrapper` has an incomplete
  discount-rate edit path: it references a non-existent `changeStabilizedInput`
  handler. Its calculation table also depends on legacy state conditions. Keep
  this behavior intact during migration; any correction needs a dedicated,
  explicitly reviewed behavior change.

## Current modernization checkpoint

- Whole-source coverage is enforced in CI at 60% statements, 60% lines, 65%
  functions, and 50% branches, so it cannot silently return to the original
  5.53% level.
- Unit and characterization tests run before the coverage gate in CI.
- `tsconfig.production.json` enforces strict production-only TypeScript with
  unused locals and parameters rejected; tests remain typechecked separately.
- `check:boundaries` rejects direct Axios use outside `src/api`, legacy
  model/ORM imports, UI imports from domain modules, and browser-global access
  outside platform adapters, the API bootstrap, and the application entry.
- The Sass split compiles byte-for-byte identically to the original stylesheet.
- CI rejects an initial application bundle more than 10% above the reviewed
  75.68 kB gzip baseline; third-party libraries remain isolated into stable
  manual chunks.
- Screenshot checks use a 0.5% changed-pixel limit and wait for fonts, images,
  API activity, loading indicators, and saving indicators before capture.
- CI runs the reviewed Chromium visual suite against the seeded Docker demo;
  the snapshot path is pinned to the reviewed Chromium/Darwin baseline names
  and the job never regenerates snapshots.
- The query/workspace boundary and migrated domain modules use typed plain data
  and immutable reducers. The legacy proxy-model compatibility facade has been
  removed; production model and ORM imports are rejected by the boundary check.
- The cross-browser deep-link contract explicitly covers TMI Expenses, Market
  Rents, and Financial Statement Audit in addition to the primary route matrix.
