#!/bin/sh

storage=$1
db=$2

if [ "$storage" = "s3" ]; then
  storage_compose="../docker-compose-s3.yml"
elif [ "$storage" = "fs" ]; then
  storage_compose="../docker-compose-fs.yml"
else
  echo "Error: Invalid storage type. Use 's3' or 'fs'." >&2
  exit 1
fi

if [ "$db" = "mongo" ]; then
  db_compose="../docker-compose-mongodb.yml"
elif [ "$db" = "postgres" ]; then
  db_compose="../docker-compose-postgresql.yml"
elif [ "$db" = "sqlite" ]; then
  db_compose="../docker-compose-sqlite.yml"
else
  echo "Error: Invalid database type. Use 'mongo', 'postgres' or 'sqlite'." >&2
  exit 1
fi

docker compose -f ../backend/docker-compose.yml -f "$storage_compose" -f "$db_compose" -f ../docker-compose-mongodb.yml -f docker-compose-test.yml up --build --abort-on-container-exit --exit-code-from test
exit_code=$?
docker compose -f ../backend/docker-compose.yml -f "$storage_compose" -f "$db_compose" -f docker-compose-test.yml down --volumes
exit $exit_code