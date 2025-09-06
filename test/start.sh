#!/bin/sh

storage=$1
db=$2
test=$3

configs=""

backend_config="-f ../backend/docker-compose.backend.yml --env-file ./test.env"
test_config="-f ./docker-compose.test.yml"

configs="$configs $backend_config"

add_service_configs() {
  local service=$1
  configs="$configs -f ../docker-compose.${service}.yml"
  if [ "$test" = "test" ]; then
    configs="$configs -f ./docker-compose.override.${service}-test.yml"
    configs="$configs --env-file ./test.${service}.env"
  fi
}

if [ "$storage" = "s3" ]; then
  add_service_configs "s3"
elif [ "$storage" = "fs" ]; then
  add_service_configs "fs"
else
  echo "Error: Invalid storage type. Use 's3' or 'fs'." >&2
  exit 1
fi

if [ "$db" = "mongo" ]; then
  add_service_configs "mongodb"
elif [ "$db" = "postgres" ]; then
  add_service_configs "postgresql"
elif [ "$db" = "sqlite" ]; then
  add_service_configs "sqlite"
else
  echo "Error: Invalid database type. Use 'mongo', 'postgres' or 'sqlite'." >&2
  exit 1
fi

configs="$configs $test_config"

echo "Using configurations: $configs"

cd ../lib
docker build . -t lufin/lib
cd ../test

# docker compose $configs config

docker compose $configs up --build --abort-on-container-exit --exit-code-from test
exit_code=$?
docker compose $configs down --volumes
exit $exit_code