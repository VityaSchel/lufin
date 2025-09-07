# lufin installation & setup

> [!Important]
> You are solely responsible for your server safety, for content uploaded through your lufin instance and how it's used.

- [lufin installation \& setup](#lufin-installation--setup)
  - [Option A. Docker (recommended)](#option-a-docker-recommended)
    - [Requirements](#requirements)
    - [Persistant data storage locations](#persistant-data-storage-locations)
    - [Install](#install)
    - [Run.sh examples](#runsh-examples)
  - [Option B. Manual install from sources](#option-b-manual-install-from-sources)
    - [Requirements](#requirements-1)
    - [Install](#install-1)
    - [Web server example configuration](#web-server-example-configuration)
  - [Troubleshooting](#troubleshooting)

Requirements:
- A domain name(s) and completed DNS setup
- A server machine capable of running 24/7
- An IP address that is publicly available in the internet
  - or a tunnel that allows your server to be reachable in the internet

## Option A. Docker (recommended)

This is the easiest and fastest way to spin up lufin. We offer any combination of dbs and storages: PostgreSQL, MongoDB or SQLite + S3 or local uploads dir. For frontend we offer Caddy with fully automatic HTTPS out of the box but you can opt out and serve static frontend yourself. [Learn more](../docker/caddy/README.md) about lufin frontend serving in Docker.

### Requirements

- [Docker Engine](https://docs.docker.com/engine/install/) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed

### Persistant data storage locations

| Container                                 | Volume                                                                                                                                                                                                                   | Docker Compose Group                                |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| Static frontend build                     | `lufin_frontend`                                                                                                                                                                                                         | **External volume outside of Docker Compose group** |
| SQLite (if choosen as db)                 | `sqlite_data`                                                                                                                                                                                                            | `lufin` Docker Compose group                        |
| PostgreSQL (if choosen as db)             | `postgresql_data`                                                                                                                                                                                                        | `lufin` Docker Compose group                        |
| MongoDB (if choosen as db)                | `mongodb_data`                                                                                                                                                                                                           | `lufin` Docker Compose group                        |
| Uploads directory (if choosen as storage) | `uploads`                                                                                                                                                                                                                | `lufin` Docker Compose group                        |
| S3 data directory (if choosen as storage) | `s3_data`                                                                                                                                                                                                                | `lufin` Docker Compose group                        |
| Caddy (if used)                           | `caddy_data` ([issued TLS certificates](https://caddyserver.com/docs/conventions#data-directory)) and `caddy_config` ([internal Caddy configurations](https://caddyserver.com/docs/conventions#configuration-directory)) | `lufin` Docker Compose group                        |
|                                           |                                                                                                                                                                                                                          |                                                     |

### Install

> [!CAUTION]
> **WORK IN PROGRESS!** Currently only test suite is working with docker
> I need to make run.sh script work with environment variables
> and write guide for you on how to properly pass these envs to docker
> stay tuned and follow [#14](https://github.com/VityaSchel/lufin/issues/14)!

> [!Note]
> Only local S3 is currently supported in Docker deployment ([minio](https://hub.docker.com/r/minio/minio))
> I'm working on adding support for external S3 such as Cloudflare R2!

1. Choose database and storage for lufin
   - Databases:
     - PostgreSQL is recommended for most cases
     - SQLite is a good alternative for low-end machines
     - MongoDB can be used as your personal preference
   - Storages:
     - Local uploads is fastest and recommended for most cases
     - Remote S3 can be used for machines with small disk capacity
2. Fill .env file
3. Run `./run.sh` command with selected database and storage passed as arguments

### Run.sh examples

Start with local uploads and SQLite:

```bash
./run.sh fs sqlite
```

Stop:

```bash
./run.sh stop fs sqlite
```

Reload:

```bash
./run.sh reload fs sqlite
```


## Option B. Manual install from sources

This is the recommended way of installing lufin for contributors or people who actively develop lufin.

> [!CAUTION]
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

1. Install frontend following steps in [frontend/README.md -> Install](../frontend/README.md#install)
2. Install backend following steps in [backend/README.md -> Install](../backend/README.md#install)
3. Set up a regular job for cleaning up expired pages to automatically run `bun /path/to/lufin/backend/src/jobs/cleanup-expired-pages.ts` command
    - One way is to use [Cron](https://en.wikipedia.org/wiki/Cron) which comes with most linux installations
      - add `0 * * * * /home/youruser/.bun/bin/bun --env-file=/var/www/lufin/backend/.env /var/www/lufin/backend/src/jobs/cleanup-expired-pages.ts` to the crontab, see [crontab.guru](https://crontab.guru/#0_*_*_*_*) to adjust frequency
4.  Set up a system daemon that will run backend (command `bun start` in the /path/to/lufin/backend directory)
    - One way is to use [systemd](https://en.wikipedia.org/wiki/Systemd) which comes with most linux installations
      - For example service config see [contrib/systemd-lufin-backend.service](../contrib/systemd-lufin-backend.service)
    - Backend must be running under the same user who created `backend/.env` file, this file contains sensetive values and should not be readable by other users
    - You should not run backend as the root user or as any other sudoer, create a separate linux user (e.g. `lufin`) and restrict its access to only lufin directory
    - You can use the `PORT` environment variable to set the backend API port
5.  Configure your reverse proxy by pointing url from `VITE_API_URL` (in `frontend/.env`) to the lufin backend (see [Web server example configuration](#web-serAver-example-configuration) below)
    - The proxy must accept websockets connections (e.g. Caddy handles it automatically, but for nginx you must add `Upgrade` and `Connection` headers)
    - If you're getting HTTP 413 errors, increase request size limit (e.g Caddy does not set any limit by default, in nginx it's 1 MB and can be configured via `client_max_body_size`)

### Web server example configuration

In order for lufin to work correctly, please ensure that your webserver+reverse proxy do the following:
1. Statically serves /path/to/repository/frontend/dist files. Does not serve files in /path/to/repository, /path/to/repository/frontend or /path/to/repository/backend.
2. Proxies requests for /api/ (or under a separate subdomain) to lufin backend port. Strip /api/ prefix if applicable i.e. https://lufin.example.org/api/foobar should be proxied to http://localhost:3000/foobar or https://api.lufin.example.org/foobar to http://localhost:3000/foobar (assuming backend is running on port 3000).

Ensure your website is secured with a TLS certificate. Caddy handles it fully automatically. Nginx requires configuration. If you use Nginx I recommend certbot with Let's Encrypt or delegate certificate management to Cloudflare.

- See [contrib/lufin.caddy](../contrib/lufin.caddy) for Caddy configuration
- See [contrib/nginx.conf](../contrib/nginx.conf) for Nginx configuration

## Troubleshooting

- If you encounter connection problems in frontend: open your browser DevTools, go to the network tab
  - "Connection refused" — you misconfigured `VITE_API_URL` in `frontend/.env` file: it must point to public url, not localhost
  - "CORS" — you misconfigured `CORS_ORIGIN` in `backend/.env` file: either comment it out or set to the frontend hostname
  - "413 Request Entity Too Large" — your reverse proxy sets a request size limit
  - Websockets connection problems — your proxy might block websocket connections by default: check cloudflare (if you're using it), check your reverse proxy settings
  - Websockets timeout — your server is uploading files to the S3 cloud so slow that you need to increase your reverse proxy connection idle timeout
- Otherwise [open an issue](https://github.com/VityaSchel/lufin/issues/new)
