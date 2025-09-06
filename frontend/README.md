# lufin frontend

- `bun dev` — Start a development server
- `bun run build` — Build static frontend
- `bun preview` — Run HTTP server that serves `dist` build directory
- `bun machine-translate` — Translate all i18n keys

## Install

Follow these steps to install frontend:

1. Run `bun ci` in your terminal
2. Run `cp .env.example .env && chmod 600 .env` in your terminal
3. Open `.env` file in your preferred code editor and fill according to [instructions](#environment-variables)
4. Run `bun run build` — this outputs a static frontend website files to the `frontend/dist` directory
   - You must to run `bun run build` command each time you edit the `frontend/.env` file
   - Set up your web server to serve `dist` directory to users (see [INSTALL.md -> Web server example configuration](../docs/INSTALL.md#web-server-example-configuration))

## Environment variables

Environment variables are inlined by Vite during build time. Runtime injection isn't possible.

- `VITE_API_URL` (Required) — full URI to API. Example: `http://localhost:4000`
- `VITE_CONTACT_EMAIL` (Optional) — contact admin email. Example: `lufin@hloth.dev`

## Docker

Build Docker image: [./docker-build.sh](./docker-build.sh). Requires [lufin/lib](../lib) Docker image available locally. The image only compiles a static frontend build without HTTP server. This should usually be coupled with [Caddy service](../docker/caddy/README.md).

Examples:

- `API_URL="http://localhost:4000" ./docker-build.sh`
- `API_URL="http://localhost:4000" PUBLIC_ADMIN_EMAIL="lufin@hloth.dev" ./docker-build.sh`
