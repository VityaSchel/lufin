#!/bin/sh

storage=$1
db=$2
test=$3

configs = ""

configs += " -f ../backend/docker-compose.yml"

if [ "$storage" = "s3" ]; then
  configs += " -f ../docker-compose.s3.yml"
  if [ "$test" = "test" ]; then
    configs += " -f ./docker-compose.override.s3-test.yml"
    configs += " --env-file ./test.s3.env"
  fi
elif [ "$storage" = "fs" ]; then
  configs += " -f ../docker-compose.fs.yml"
  if [ "$test" = "test" ]; then
    configs += " -f ./docker-compose.override.fs-test.yml"
    configs += " --env-file ./test.fs.env"
  fi
else
  echo "Error: Invalid storage type. Use 's3' or 'fs'." >&2
  exit 1
fi

if [ "$db" = "mongo" ]; then
  configs += " -f ../docker-compose.mongodb.yml"
  if [ "$test" = "test" ]; then
    configs += " -f ./docker-compose.override.mongodb-test.yml"
    configs += " --env-file ./test.mongodb.env"
  fi
elif [ "$db" = "postgres" ]; then
  configs += " -f ../docker-compose.postgresql.yml"
  if [ "$test" = "test" ]; then
    configs += " -f ./docker-compose.override.postgresql-test.yml"
    configs += " --env-file ./test.postgresql.env"
  fi
elif [ "$db" = "sqlite" ]; then
  configs += " -f ../docker-compose.sqlite.yml"
  if [ "$test" = "test" ]; then
    configs += " -f ./docker-compose.override.sqlite-test.yml"
    configs += " --env-file ./test.sqlite.env"
  fi
else
  echo "Error: Invalid database type. Use 'mongo', 'postgres' or 'sqlite'." >&2
  exit 1
fi

configs += " -f docker-compose.yml"

docker compose "$configs" up --build --abort-on-container-exit --exit-code-from test
exit_code=$?
docker compose "$configs" down --volumes
exit $exit_code