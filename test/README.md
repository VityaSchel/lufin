# Lufin test suite

- `bun start` — Start test suite (uses [Bun test runner](https://bun.com/docs/cli/test), runs `bun test --bail --runInBand`)

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
- `BACKEND_URI` (Required) — Full URL of API

## Docker

Build Docker image: [./docker-build.sh](./docker-build.sh).

Run Docker image: `docker run --env-file .env -it lufin/test`

Test all combinations: `./start-all.sh`