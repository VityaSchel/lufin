# lufin caddy server

lufin's frontend is static, meaning it has to be served by a running web server. To provide deploy flexibility, frontend is decoupled from a web server, so you can choose any web server you want to serve the frontend.

The recommended web server that runs lufin static frontend is Caddy.

- ✅ Automatically handles everything about HTTPS from certificate management to redirects
- ✅ Backend (API) configuration out of the box
- ✅ Extendable and easily configurable ([learn more](https://caddyserver.com/docs/) about Caddy)

## Run

Recommended way is to run it with all other services via run.sh script. If you're coming from [INSTALL.md](../../docs/INSTALL.md#option-a-docker-recommended), simply follow the steps there.

To start Caddy serving frontend and backend in Docker:
1. Build [lufin/lib](../../lib/README.md) image
2. Build [lufin/frontend](../../frontend/README.md#docker) image
3. Mount frontend container's /usr/src/app/dist to `lufin_frontend`
4. Run Caddy compose config with
   - `DOMAIN` environment variable to automatically issue a TLS certificate
   - (Optionally) `BACKEND_PORT` to configure the port that the backend is running on in internal lufin containers network. 

Example with SQLite and local uploads dir:

```bash
export DOMAIN="localhost"
export CADDY_DOMAIN=$DOMAIN
export EMAIL="lufin@fake.local"

# Do not change lines below
export API_URL="https://${DOMAIN}/api/"
export PUBLIC_ADMIN_EMAIL="${EMAIL}"
(cd ../../lib && ./docker-build.sh)
(cd ../../frontend && ./docker-build.sh)
docker compose -f ../../docker-compose.yml -f ../../backend/docker-compose.backend.yml -f ./docker-compose.caddy.yml -f ../docker-compose.fs.yml -f ../docker-compose.sqlite.yml up --build -d
```

To permanently delete everything including database and uploaded files (**DANGER!!**):

```bash
docker compose -f ../../docker-compose.yml -f ./docker-compose.caddy.yml -f ../docker-compose.fs.yml -f ../docker-compose.sqlite.yml -f ../../backend/docker-compose.backend.yml down --volumes
```

## Local HTTPS

If you specified a local domain (such as `localhost`), you need to add Caddy's root CA certificate to your system/browser/proxy. [Learn more](https://caddyserver.com/docs/running#local-https-with-docker) about Caddy's root CA for local HTTPS. **You don't need to do this for real domains.**

As of 2025/09/07 the following examples should work. Note that many web browsers ignore system's trust store nowadays. Refer to the Caddy documentation to learn how to add Caddy's root CA to browser's trust store.

Linux:

```bash
docker compose cp caddy:/data/caddy/pki/authorities/local/root.crt /usr/local/share/ca-certificates/lufin-local-https.crt && sudo update-ca-certificates
```

macOS:

```bash
docker compose cp caddy:/data/caddy/pki/authorities/local/root.crt /tmp/lufin-local-https.crt && sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain /tmp/lufin-local-https.crt
```

Windows:

```bash
docker compose cp caddy:/data/caddy/pki/authorities/local/root.crt %TEMP%/lufin-local-https.crt && certutil -addstore -f "ROOT" %TEMP%/lufin-local-https.crt
```
