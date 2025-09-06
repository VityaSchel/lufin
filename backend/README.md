# Lufin backend

- `bun dev` — Start a development server (not recommended for production, see below)
- `bun start` — Start a production server
- `bun db:migrate` — Create schema in SQL database (only for PostgreSQL and SQLite)
- `bun dev:db:generate` — (For development) generate a new Drizzle ORM schema and migrations from previous layer
- `bun dev:db:forcepush` — (For development) forcefully push current schema without migrations to the db

Development server displays internal server errors in human-readable format for debugging, leaking path to lufin on your instance as well as any context information. Don't run it (`bun dev`) in production, rather use `bun start`!

## Environment variables

- Database variables (Required, exactly one of the following is expected)
  - `MONGODB_CONNECTION_STRING` — MongoDB connection string with database. Example: `mongodb://localhost:27017/lufin`
  - `POSTGRESQL_CONNECTION_STRING` — PostgreSQL connection string with database. Example: `postgresql://localhost:5432/lufin`
  - `SQLITE_DB_PATH` — SQLite database file path. Example: `./lufin.db`
- Storage variables (Required, exactly one type of storage is expected)
  - S3 variables:
    - `S3_ACCESS_KEY` (Required) — S3 Access Key ID
    - `S3_SECRET_ACCESS_KEY` (Required) — S3 Access Key Secret
    - `S3_ENDPOINT` (Required) — S3 endpoint
    - `S3_BUCKET` (Required) — S3 bucket name. Example: `lufin`
    - `S3_REGION` (Optional) — S3 region, if your provider requires one. Example: `weur`
  - Local filesystem variables:
    - `UPLOADS_DIR` (Required) — Writable directory for uploaded files
- `CORS_ORIGIN` (Optional) — Value for `Access-Control-Allow-Origin` header in responses. Required for frontend to work if you're hosting backend on a separate domain/subdomain.
- `GRACE_PERIOD` (Optional) — Time in seconds to keep the page files after expiration to allow initialized downloads to complete. Default: `7200`

## Docker

Build Docker image: [./docker-build.sh](./docker-build.sh).

Run Docker image:
`docker run --env-file .env -p 4000:3000 -v /tmp/lufin-backend:/tmp -it lufin/backend` (Assuming you want to bind backend to port 4000, have UPLOADS_DIR defined as storage, SQLITE as db and want to mount data directory to /tmp/lufin-backend on your host machine)
