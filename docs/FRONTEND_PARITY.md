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

## Functional baseline

`client/e2e/local-demo.spec.js` is the cross-browser workflow contract. Refactors
must retain route behavior, visible controls and labels, interaction order, focus
destinations, feedback, request payloads, and persisted results after reload.

Unrelated behavior fixes are kept out of modernization changes and handled as
separate, explicitly reviewed work.

## Current modernization checkpoint

- Whole-source coverage: 23.29% statements, 22.14% lines, 21.02% functions,
  and 18.49% branches. CI floors are set to 23/22/20/18 so coverage cannot
  silently return to the original 5.53% level.
- Unit/characterization suite: 112 passing tests across 19 files.
- The Sass split compiles byte-for-byte identically to the original stylesheet.
- The production build currently emits 77.09 kB gzip of application JavaScript,
  with third-party libraries isolated into stable manual chunks.
- Screenshot checks use a 0.5% changed-pixel limit and wait for fonts, images,
  API activity, loading indicators, and saving indicators before capture.
- The query/workspace boundary and migrated domain modules retain a proxy-model
  compatibility facade for feature screens that have not yet moved to immutable
  reducers. The facade must remain until all production imports reach zero.
