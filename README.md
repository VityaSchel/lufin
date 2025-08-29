# Lufin — a modern self-hosted file-sharing service

[![CodeQL status](https://github.com/VityaSchel/lufin/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/VityaSchel/lufin/actions/workflows/github-code-scanning/codeql)

Lufin (Let’s Upload that File—Next) is a modern alternative to [lufi](https://framagit.org/fiat-tux/hat-softwares/lufi).

<p float="left">
  <img src="docs/screenshot-1.png" width="49%" />
  <img src="docs/screenshot-2.png" width="49%" /> 
</p>

- ✨ Modern neat design
- 📁 S3 storage support (with Cloudflare R2 compatability)
- 🌄 Rich client-side preview for
  - 🖼️ Images
  - 🎵 Audio
  - 🎥 Video
  - 🗂️ Zip archives
  - 📊 XLSX spreadsheets
  - 📝 Text files
  - 📖 PDF
- 🗣️ Translated to 26 languages: English, Русский, Українська, Беларуская, Български, Čeština, Dansk, Nederlands, Eesti, Suomi, Français, Deutsch, Ελληνικά, Magyar, Italiano, Latviešu, Lietuvių, Norsk, Polski, Português, Română, Slovenčina, Slovenščina, Español, Svenska, Türkçe. See [CONTRIBUTING.md](./CONTRIBUTING.md#Translation) for info how to contibute support for a language.
- 🛡️ Client-side metadata stripping such as EXIF from images
- 🔥 Configurable data retention settings based on files size
- 🔐 Optional end-to-end encryption using AES-GCM allowing user to opt-out to embed files via hotlinks
- 🔑 Password protection
- 👀 Delete at first downlaod
- 🗃️ Client-side archive generation before uploading
- 📸 Client-side image compression
- ✏️ Automatic file renaming with option to keep original filenames
- 📀 Multiple databases support (MongoDB, PostgreSQL, SQLite)
- ⚡️ Fully static frontend (no SSR, no Next.js needed running for the website)
- 💻 Links to uploaded files are stored in LocalStorage
- 💾 Importable/exportable LocalStorage with a button to clean up expired pages

**This app requires JavaScript in order for client-side encryption to work.**

Stack: React, Vite & Rollup, Material UI, SCSS modules, TailwindCSS, MongoDB, PostgreSQL, Drizzle ORM & Kit, Elysia, Bun.

Demo: [lufin.hloth.dev](https://lufin.hloth.dev)

> [!NOTE]
> It’s a demo website and files get deleted very quickly, it’s only purpose is demonstration of the project

- [Lufin — a modern self-hosted file-sharing service](#lufin--a-modern-self-hosted-file-sharing-service)
  - [Screenshotter browser extension](#screenshotter-browser-extension)
  - [Installation](#installation)
  - [Troubleshoot](#troubleshoot)
  - [Nginx example configuration](#nginx-example-configuration)
  - [For advanced users](#for-advanced-users)
    - [(Optional) compile backend to a binary](#optional-compile-backend-to-a-binary)
  - [FAQ](#faq)
    - [Motivation](#motivation)
    - [Why no docker?](#why-no-docker)
    - [Why there are no compiled releases?](#why-there-are-no-compiled-releases)
  - [License](#license)
  - [Donate](#donate)


## Screenshotter browser extension

See also: a related project — Firefox-based browser extension for taking full-screen, partial, full-screen cropped screenshots, with a built-in image editor and an option to instantly upload to your choosen lufin instance. Free, no ads, no trackers, no metrics, 100% opensource.

<img width="1505" alt="Screenshotter editor" src="https://github.com/user-attachments/assets/89d9ac3a-cf86-480e-bb21-b8edb08bd069" />

[Visit screenshotter repository](https://github.com/VityaSchel/lufin-screenshotter)

## Installation

> [!Important]
> You are solely responsible for your server safety, for content uploaded through your lufin instance and how it’s used. Do not expose your database to the internet unless you’re 100% sure it’s secured with strong authorization mechanisms.

Requirements:

- A domain name(s) and completed DNS setup
- A server with an IP address that is publicly available in the internet
- A webserver that is capable of serving static HTML, CSS and JS files, such as Nginx, running on your server
- A reverse proxy service, such as Nginx, running on your server
- An SSL certificate such as from Let’s Encrypt or Cloudflare
- [Bun.sh](https://bun.sh) installed. Node.js and deno are not supported.
- A S3-compatible bucket. One easy & free way to obtain a personal S3 is to sign up in Cloudflare and use Cloudflare R2 (you can obtain S3 credentials in Cloudflare R2 -> API -> Account Tokens).
- A database installed, configured and ready to accept connections. Below are supported databases:
  - **MongoDB:** Community Edition and Mongo Atlas will both work. No schema setup needed from your end.
  - **PostgreSQL:** Tested on v14 and v17. Drizzle ORM handles everything related to schema.
  - **SQLite:** Uses [bun:sqlite](https://bun.sh/docs/api/sqlite). Tested and supported, but due to synchronius nature and thread blocking, not recommended for high load.
  - Easiest & instant setup — choose SQLite. Flexibility & faster setup — choose MongoDB. Speed, best class security, more tutorials and stability — choose PostgreSQL. All have been tested, have equal support and good for Lufin.
  - For server-based databases (Mongo, Postgres): create a database (e.g. `lufin`) and a user (e.g. `lufin`) with full access only to that database. Obtain the connection string (e.g. `mongodb://lufin:strongpassword@localhost:27017/lufin` or `postgresql://lufin:strongpassword@localhost:5432/lufin`). The database must be separate from any other services and empty.

Step by step guide to install Lufin:

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
   - Set up your web server to serve `dist` directory to users (see [nginx example configuration](#nginx-example-configuration) below)
   - Do not serve the repository’s root
   - Do not serve the frontend directory
8. Go back to the repository’s root and open `backend` directory
9. Run `bun ci` in your terminal
10. Run `cp .env.example .env && chmod 600 .env` in your terminal
11. Open `backend/.env` file in your preferred code editor
12. Fill it according to these instructions:
    - **If you’re running MongoDB:** `MONGODB_CONNECTION_STRING` must be set to the mongodb connection string
    - **or, if you’re running PostgreSQL:** `POSTGRESQL_CONNECTION_STRING` must be set to the postgres connection string
    - **or, if you’re running SQLite:** `SQLITE_DB_PATH` must be set to path to the sqlite database file
    - Only set one of those. Prepend disabled databases with a `#` character to comment it out in .env file.
    - For server-based databases (Mongo, Postgres): make sure the connection string includes database name (e.g. `mongodb://localhost:27017/lufin` or `postgresql://localhost:5432/lufin`)
    - `S3_ACCESS_KEY`, `S3_SECRET_ACCESS_KEY`, `S3_ENDPOINT`, `S3_BUCKET` must be set to your S3 bucket credentials
    - Optional: `S3_REGION` can be set if your S3 provider requires it
    - Optional (recommended if your frontend and backend are on separate domains or subdomains): `CORS_ORIGIN` — set it to your domain name to enable [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
13. Only for SQL databases (Postgres, SQLite): run `bun db:migrate` in your terminal
14. Run `cp data-retention.config.example.json data-retention.config.json` in your terminal
15. Open `data-retention.config.json` file in your preferred code editor
    - This config defines file pages expiration settings for your lufin instance
    - `seconds` is max. time for a file up to `limit` megabytes (1000 \* 1000 bytes) to be stored on your server
    - In the example you’ve just copied:
      - files up to 10 MB can be stored at most for 365 days
      - files up to 50 MB can be stored at most for 150 days
      - files up to 100 megabytes can be stored at most 50 days
      - files over 100 megabytes cannot be stored
    - This limitation is enforced for sum size of all files within one page, these limits don’t prevent an abuser from creating several pages and uploading several big files
    - It’s not recommended to set limit more than 100 MB because chunking is not supported
    - If you use Cloudflare free tier, they will limit your uploads to 100 MB anyway
16. Set up a regular job for cleaning up expired pages to automaticall run `bun /path/to/lufin/backend/src/jobs/cleanup-expired-pages.ts` command
    - One way is to use [Cron](https://en.wikipedia.org/wiki/Cron) which comes with most linux installations
      - add `0 * * * * /home/youruser/.bun/bin/bun --env-file=/var/www/lufin/backend/.env /var/www/lufin/backend/src/jobs/cleanup-expired-pages.ts` to the crontab, see [crontab.guru](https://crontab.guru/#0_*_*_*_*) to adjust frequency
17. Set up a system daemon that will run backend (command `bun start` in the /path/to/lufin/backend directory)
    - One way is to use [systemd](https://en.wikipedia.org/wiki/Systemd) which comes with most linux installations
      - For example service config see [contrib/systemd-lufin-backend.service](./contrib/systemd-lufin-backend.service)
    - Backend must be running under the same user who created `backend/.env` file, this file contains sensetive values and should not be readable by other users
    - You should not run backend as the root user or as any other sudoer, create a separate linux user (e.g. `lufin`) and restrict its access to only lufin directory
    - You can use the `PORT` environment variable to set the backend API port
18. Configure your reverse proxy by pointing url from `VITE_API_URL` (in `frontend/.env`) to the lufin backend (see [nginx example configuration](#nginx-example-configuration) below)
    - The proxy must accept websockets connections (in nginx, add `Upgrade` and `Connection` headers)
    - If you’re getting HTTP 413 errors, increase request size limit (in nginx, it’s 1 MB, can be configured via `client_max_body_size`)

## Troubleshoot

- If you encounter connection problems in frontend: open your browser DevTools, go to the network tab
  - "Connection refused" — you misconfigured `VITE_API_URL` in `frontend/.env` file: it must point to public url, not localhost
  - "CORS" — you misconfigured `CORS_ORIGIN` in `backend/.env` file: either comment it out or set to the frontend hostname
  - "413 Request Entity Too Large" — your reverse proxy sets a request size limit
  - Websockets connection problems — your proxy might block websocket connections by default: check cloudflare (if you’re using it), check your reverse proxy settings
  - Websockets timeout — your server is uploading files to the S3 cloud so slow that you need to increase your reverse proxy connection idle timeout
- Otherwise open an issue

## Nginx example configuration

I recommend using Nginx as a reverse proxy and a web server. See [contrib/nginx.conf](contrib/nginx.conf) for example on how to use Nginx with lufin.

## For advanced users

### (Optional) compile backend to a binary

A binary file is slightly faster and has smaller memory footprint.

```bash
bun build \
	--compile \
	--minify-whitespace \
	--minify-syntax \
	--target bun \
	--outfile server \
	./src/index.ts
```

And then run `./server` instead of `bun start`

## FAQ

### Motivation

I was working on this project in August 2023 - October 2023 as a part of a larger platform for one of my Freelance clients. In late 2024 I had to leave working on them because they were constantly harassing, threatening and abusing me. This is a cleaned up version of filesharing subproject that I made for them, originally built as a microfrontend for Next.js.

I made this project while I was working primarily with React and Next.js as web frameworks and MongoDB as my favorite database. Things have changed and nowadays I only use Svelte and PostgreSQL. First commits were deliberetly offset by exactly -22 months.

Before publishing this project I rewrote the backend from Fastify to Elysia, migrated from Next.js to Vite, from Next router to React Router, from i18next to paraglide js, optimized build size and separated code to dynamic chunks.

### Why no docker?

There is nothing to dockerize. I could maybe put Bun, certbot and database together but IMO that really only makes it more complex. lmk in issues if you really want docker and I’ll do it.

### Why there are no compiled releases?

Don’t trust strangers on the internet, compile it yourself.

## License

[MIT](./LICENSE)

## Donate

[hloth.dev/donate](https://hloth.dev/donate)
