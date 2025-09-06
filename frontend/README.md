# Lufin frontend

- `bun dev` — Start a development server
- `bun run build` — Build static frontend
- `bun preview` — Run HTTP server that serves `dist` build directory
- `bun machine-translate` — Translate all i18n keys

## Environment variables

Environment variables are inlined by Vite during build time. Runtime injection isn't possible.

- `VITE_API_URL` (Required) — full URI to API. Example: `http://localhost:4000`
- `VITE_CONTACT_EMAIL` (Optional) — contact admin email. Example: `lufin@hloth.dev`

## Docker

Build Docker image: [./docker-build.sh](./docker-build.sh). Requires [lufin/lib](../lib) Docker image available locally. Examples:

- `API_URL="http://localhost:4000" ./docker-build.sh`
- `API_URL="http://localhost:4000" PUBLIC_ADMIN_EMAIL="lufin@hloth.dev" ./docker-build.sh`

Run Docker image:

`docker run -p 443:3000 -it lufin/frontend` (Assuming you want to bind frontend to port 443)

Docker compose examples:

- `PORT=3000 API_URL="http://localhost:4000" docker compose up`
- `PORT=3000 API_URL="http://localhost:4000" PUBLIC_ADMIN_EMAIL="lufin@hloth.dev" docker compose up`
