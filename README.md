# Swiftly local demo

Swiftly is a persistent, single-user appraisal demo built on FastAPI, Vite/React, and MongoDB. The retired Pyramid/TensorFlow/vector runtime is not part of this application.

## Run with Docker

1. Copy `.env.example` to `.env` and set `OPENAI_API_KEY` when document extraction is needed.
2. Run `docker compose up --build`.
3. Open `http://localhost:5173`. The seeded **Harbour Centre Demo** appraisal and all later edits persist in Docker volumes.

The API is at `http://localhost:8000`; `GET /health` verifies the API and MongoDB connection. Uploads persist in the `swiftly_files` volume. If those host ports are busy, set `API_PORT`, `WEB_PORT`, or `MONGO_PORT` in `.env` before starting Compose. Without an OpenAI key, uploads and manual editing work normally and an extraction job finishes with a visible, recoverable configuration error.

## Native development

Copy `.env.example` to the repository-root `.env`, start MongoDB locally, then run `python3.12 -m venv .venv && .venv/bin/pip install -r requirements-dev.txt && .venv/bin/uvicorn app.main:app --reload` from `api`. Use Node 22.22.0 or newer (the repository `.nvmrc`, CI, and Docker image are pinned to 22.22.0), then run `npm ci && npm run dev` from `client`. Both processes read the same root `.env`; the sample uses `mongodb://localhost:27017` for native development while Compose overrides it to its internal Mongo service. Relative `DATA_DIR` values are rooted at the repository, so uploads persist at `./data` in either native workflow.

Run the quality checks with `pip install -r requirements-dev.txt && ruff check app tests && pytest -q` in `api`, and `npm run lint && npm run typecheck && npm test && npm run build` in `client`.
With Compose running, execute `E2E_BASE_URL=http://localhost:5173 npm run test:e2e` in `client` to verify the no-login workflow, uploads, persistence mutations, and each appraisal navigation area.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the backend repository/service boundaries, frontend API rules, and guidance for extending the application without reintroducing cross-layer coupling.

## Extraction contract

`POST /appraisals/{id}/files` stores the source file. `POST /appraisals/{id}/files/{fileId}/extract` queues work, `GET /extractions/{jobId}` reads status, and `PATCH /appraisals/{id}/files/{fileId}/extraction` saves reviewer corrections. All internal API resources use the canonical plural routes; removed singular routes return 404.

The OpenAI adapter uses Responses API structured output with `OPENAI_MODEL=gpt-5` by default. It supplies the original uploaded document as a temporary file input, locally extracted text, and rendered page-image input; temporary provider files are deleted after each completed request. Results record document type, confidence, editable fields and rows, and page/text citations. See the [official Responses API reference](https://developers.openai.com/api/reference/cli/resources/responses/methods/create).

## Security note

Secrets have been removed from the active runtime. Rotation and history rewriting require access to the original cloud/auth providers and repository remote; do those before publishing this repository.
