#!/bin/sh

set -euo pipefail

storage=${1:-}
db=${2:-}
test=${3:-}

if [ -z "$storage" ] || [ -z "$db" ]; then
  echo "Usage: $0 <storage> <db> [test]" >&2
  echo "- storage: 's3' or 'fs'" >&2
  echo "- db: 'mongo', 'postgres' or 'sqlite'" >&2
  echo "- test: 'test' to run tests, omit to run normally" >&2
  exit 1
fi

configs=""

backend_config="-f ./backend/docker-compose.backend.yml"
if [ "$test" = "test" ]; then
  backend_config="$backend_config --env-file ./test/test.env"
fi

configs="$configs $backend_config"

add_service_configs() {
  local service=$1
  configs="$configs -f ./docker/docker-compose.${service}.yml"
  if [ "$test" = "test" ]; then
    configs="$configs -f ./test/docker-compose.override.${service}-test.yml"
    configs="$configs --env-file ./test/test.${service}.env"
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

if [ "$test" = "test" ]; then
  test_config="-f ./test/docker-compose.test.yml"
  configs="$configs $test_config"
fi

echo "$configs"