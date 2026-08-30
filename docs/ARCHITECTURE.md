# Swiftly architecture

Swiftly remains a single-user local application. The refactor preserves its public browser behavior, plural API routes, response envelopes, `_id` identifiers, and Mongo document shapes.

## Backend boundaries

`app.main.create_app` owns FastAPI construction, lifecycle, and infrastructure wiring. Feature routers translate HTTP input and output. Multi-step work belongs in `app.services`; Mongo access goes through `app.repositories`. Routers must not implement document rendering, extraction, calculations, or report generation.

Uploaded assets are server-owned. `file_storage` is the only module that creates, resolves, or deletes paths, and it rejects paths outside the configured data directory. API responses omit storage paths, hashes, and rendered image filenames.

When adding a route:

1. Preserve the established response envelope unless the client and contract tests are intentionally updated together.
2. Put persistence behind a repository and workflow logic behind a service.
3. Add an API contract test and unit tests for new service behavior.

## Frontend boundaries

Components and domain models do not import Axios. Typed services in `src/api/resources.ts` own HTTP paths, unwrap the existing response envelopes, and normalize failures as `ApiError`. URL-only helpers such as report and rendered-page links remain in the API directory.

The existing class components and proxy-based model layer remain supported. Models contain domain behavior and dirty tracking, but never network access. Large feature containers own loading and save coordination; extracted leaf components render data and emit callbacks.

New API-boundary code is TypeScript. Existing feature code stays JavaScript unless it is already being materially refactored.

## Verification

- API: `ruff check app tests && pytest -q --cov=app.services --cov-fail-under=85`
- Client: `npm run lint && npm run typecheck && npm test && npm run test:coverage && npm run build`
- Browser workflows: start Compose and run `E2E_BASE_URL=http://localhost:5173 npm run test:e2e`

Coverage thresholds record the current baseline and must only move upward. The Playwright suite is the compatibility contract for user-visible behavior.
