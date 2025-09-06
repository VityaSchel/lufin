# Installation & setup

> [!Important]
> You are solely responsible for your server safety, for content uploaded through your lufin instance and how it's used.

- [Installation \& setup](#installation--setup)
  - [Option A. Docker](#option-a-docker)
    - [Requirements](#requirements)
    - [Install](#install)
  - [Option B. Manual install](#option-b-manual-install)
    - [Requirements](#requirements-1)
    - [Install](#install-1)
    - [Web server example configuration](#web-server-example-configuration)
  - [Troubleshoot](#troubleshoot)

Please familiarize yourself with all installation options and choose a single one to start.

Requirements for any option:
- A domain name(s) and completed DNS setup
- A server
- An IP address that is publicly available in the internet
  - or a tunnel that allows your server to be reachable in the internet

## Option A. Docker

This is the easiest and fastest way to spin up lufin with everything needed bundled into a single container. Currently only a single container is available with PostgreSQL DB, managed  and storing files locally as a mounted Docker volume.

### Requirements

- [Docker](https://docs.docker.com/engine/install/) installed

### Install

TBD

## Option B. Manual install

This is the most flexible way to install and manage lufin. It's preferred if you already have a DBMS running on your server. It also allows you to easily modify source code tailored for your needs.

> [!Important]
> Do not expose your database to the internet unless you're 100% sure it's secured with strong authorization mechanisms.

### Requirements

- A webserver running on your machine that is capable of 1. serving static files 2. reverse proxying requests to backend; I recommend [Caddy](https://caddyserver.com/) but [Nginx](https://nginx.org/) is fine too
- A TLS certificate (tip: you can get a completely free one from Let's Encrypt, Zero SSL or Cloudflare!)
- [Bun.sh](https://bun.sh) installed. Node.js and deno are not supported.
- A place where you're going to store files
  - Option 1: an S3-compatible bucket. One easy & free way to obtain a personal S3 is to sign up in Cloudflare and use Cloudflare R2 (you can obtain S3 credentials in Cloudflare R2 -> API -> Account Tokens).
  - Option 2: a designated directory in your file system.
- A database installed, configured and ready to accept connections
  - Option 1: PostgreSQL. Best-class. Tested on v14 and v17. Drizzle ORM handles everything related to schema.
  - Option 2: MongoDB. Flexible. Tested on Community Edition v8. No manual schema setup needed.
  - Option 3: SQLite. Easiest setup. Uses [bun:sqlite](https://bun.sh/docs/api/sqlite). Synchronous and thread blocking so not recommended for high load.
  - Only for DBMS (Options 1 & 2): create a database (e.g. `lufin`) and a user (e.g. `lufin`) with full access only to that database. Obtain the connection string (e.g. `mongodb://lufin:strongpassword@localhost:27017/lufin` or `postgresql://lufin:strongpassword@localhost:5432/lufin`). The database must be separate from any other services and empty.

### Install

1. Clone this repository to your server
2. Open `frontend` directory
3. Run `bun ci` in your terminal
4. Run `cp .env.example .env && chmod 600 .env` in your terminal
5. Open `frontend/.env` file in your preferred code editor
6. Fill it according to these instructions:
   - `VITE_API_URL` must point to the **public url** of backend **with trailing slash** (e.g. `https://lufin.hloth.dev/api/`)
   - Optional: `VITE_CONTACT_EMAIL` — your email address displayed publicly for all users (e.g. `admin@example.org`)
7. Run `bun run build` — this outputs a static frontend website files to the `frontend/dist` directory
   - You must to run `bun run build` command each time you edit the `frontend/.env` file
   - Set up your web server to serve `dist` directory to users (see [Web server example configuration](#web-server-example-configuration) below)
   - Do not serve the repository's root
   - Do not serve the frontend directory
8. Go back to the repository's root and open `backend` directory
9. Run `bun ci` in your terminal
10. Run `cp .env.example .env && chmod 600 .env` in your terminal
11. Open `backend/.env` file in your preferred code editor
12. Put database credentials:
    - **If you're running MongoDB:** `MONGODB_CONNECTION_STRING` must be set to the mongodb connection string
    - **or, if you're running PostgreSQL:** `POSTGRESQL_CONNECTION_STRING` must be set to the postgres connection string
    - **or, if you're running SQLite:** `SQLITE_DB_PATH` must be set to path to the sqlite database file
    - Only set one of those. Prepend disabled databases with a `#` character to comment it out in .env file.
    - For server-based databases (Mongo, Postgres): make sure the connection string includes database name (e.g. `mongodb://localhost:27017/lufin` or `postgresql://localhost:5432/lufin`)
13. Put storage credentials:
    - **If you're running S3/R2:** `S3_ACCESS_KEY`, `S3_SECRET_ACCESS_KEY`, `S3_ENDPOINT`, `S3_BUCKET` must be set to your S3 bucket credentials
        - Optional: `S3_REGION` can be set if your S3 provider requires it
    - **or, if you're storing files locally:** `UPLOADS_DIR` must be set to path of the directory where encrypted uploads will be stored
14. Other variables:
    - Optional (recommended if your frontend and backend are on separate domains or subdomains): `CORS_ORIGIN` — set it to your domain name to enable [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
15. Only for SQL databases (Postgres, SQLite): run `bun db:migrate` in your terminal
16. Run `cp data-retention.config.example.json data-retention.config.json` in your terminal
17. Open `data-retention.config.json` file in your preferred code editor
    - This config defines file pages expiration settings for your lufin instance
    - `seconds` is max. time for a file up to `limit` megabytes (1000 \* 1000 bytes) to be stored on your server
    - In the example you've just copied:
      - files up to 10 MB can be stored at most for 365 days
      - files up to 50 MB can be stored at most for 150 days
      - files up to 100 megabytes can be stored at most 50 days
      - files over 100 megabytes cannot be stored
    - This limitation is enforced for sum size of all files within one page, these limits don't prevent an abuser from creating several pages and uploading several big files
    - It's not recommended to set limit more than 100 MB because chunking is not supported
    - If you use Cloudflare free tier, they will limit your uploads to 100 MB anyway
18. Set up a regular job for cleaning up expired pages to automaticall run `bun /path/to/lufin/backend/src/jobs/cleanup-expired-pages.ts` command
    - One way is to use [Cron](https://en.wikipedia.org/wiki/Cron) which comes with most linux installations
      - add `0 * * * * /home/youruser/.bun/bin/bun --env-file=/var/www/lufin/backend/.env /var/www/lufin/backend/src/jobs/cleanup-expired-pages.ts` to the crontab, see [crontab.guru](https://crontab.guru/#0_*_*_*_*) to adjust frequency
19. Set up a system daemon that will run backend (command `bun start` in the /path/to/lufin/backend directory)
    - One way is to use [systemd](https://en.wikipedia.org/wiki/Systemd) which comes with most linux installations
      - For example service config see [contrib/systemd-lufin-backend.service](./contrib/systemd-lufin-backend.service)
    - Backend must be running under the same user who created `backend/.env` file, this file contains sensetive values and should not be readable by other users
    - You should not run backend as the root user or as any other sudoer, create a separate linux user (e.g. `lufin`) and restrict its access to only lufin directory
    - You can use the `PORT` environment variable to set the backend API port
20. Configure your reverse proxy by pointing url from `VITE_API_URL` (in `frontend/.env`) to the lufin backend (see [WEb server example configuration](#web-server-example-configuration) below)
    - The proxy must accept websockets connections (e.g. Caddy handles it automatically, but for nginx you must add `Upgrade` and `Connection` headers)
    - If you're getting HTTP 413 errors, increase request size limit (e.g Caddy does not set any limit by default, in nginx it's 1 MB and can be configured via `client_max_body_size`)

### Web server example configuration

In order for lufin to work correctly, please ensure that your webserver+reverse proxy do the following:
1. Statically serves /path/to/repository/frontend/dist files. Does not serve files in /path/to/repository, /path/to/repository/frontend or /path/to/repository/backend.
2. Proxies requests for /api/ (or under a separate subdomain) to lufin backend port. Strip /api/ prefix if applicable i.e. https://lufin.example.org/api/foobar should be proxied to http://localhost:3000/foobar or https://api.lufin.example.org/foobar to http://localhost:3000/foobar (assuming backend is running on port 3000).

Ensure your website is secured with a TLS certificate. Caddy handles it fully automatically. Nginx requires configuration. If you use Nginx I recommend certbot with Let's Encrypt or delegate certificate management to Cloudflare.

- See [contrib/lufin.caddy](contrib/lufin.caddy) for Caddy configuration
- See [contrib/nginx.conf](contrib/nginx.conf) for Nginx configuration

## Troubleshoot

- If you encounter connection problems in frontend: open your browser DevTools, go to the network tab
  - "Connection refused" — you misconfigured `VITE_API_URL` in `frontend/.env` file: it must point to public url, not localhost
  - "CORS" — you misconfigured `CORS_ORIGIN` in `backend/.env` file: either comment it out or set to the frontend hostname
  - "413 Request Entity Too Large" — your reverse proxy sets a request size limit
  - Websockets connection problems — your proxy might block websocket connections by default: check cloudflare (if you're using it), check your reverse proxy settings
  - Websockets timeout — your server is uploading files to the S3 cloud so slow that you need to increase your reverse proxy connection idle timeout
- Otherwise [open an issue](https://github.com/VityaSchel/lufin/issues/new)
