# lufin caddy server

lufin's frontend is static meaning it has to be served by a running web server. To provide deploy flexibility, frontend is decoupled from a web server, meaning you can choose any web server to serve frontend you want.

The recommended server that runs lufin static frontend out of the box is Caddy.

- ✅ Automatically handles everything about HTTPS from certificate management to redirects
- ✅ Backend configuration out of the box
- ✅ Extendable and easy configurable ([learn more](https://caddyserver.com/docs/) about Caddy)

## Run

To start Caddy serving frontend and backend in Docker Compose, 