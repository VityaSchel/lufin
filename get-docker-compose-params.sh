#!/bin/bash

set -euo pipefail

storage=""
db=""
test="0"
webserver=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --storage)
      storage="$2"
      shift 2
      ;;
    --db)
      db="$2"
      shift 2
      ;;
    --test)
      test="1"
      shift
      ;;
    --caddy)
      webserver="caddy"
      shift
      ;;
    -h|--help)
      echo "Usage: $0 --storage <storage> --db <db> [--caddy] [--test]"
      echo "Options:"
      echo "  --storage   Storage type: 's3' or 'fs'"
      echo "  --db        Database type: 'mongo', 'postgres' or 'sqlite'"
      echo "  --caddy     Add Caddy web server"
      echo "  --test      Run in test mode"
      echo "  -h, --help  Show this help message"
      exit 0
      ;;
    *)
      echo "Error: Unknown option $1" >&2
      echo "Use --help for usage information" >&2
      exit 1
      ;;
  esac
done

if [ -z "$storage" ] || [ -z "$db" ]; then
  echo "Error: Missing required arguments" >&2
  echo "Usage: $0 --storage <storage> --db <db> [--test]" >&2
  echo "Use --help for more information" >&2
  exit 1
fi

configs="-f ./docker-compose.yml"

backend_config="-f ./backend/docker-compose.backend.yml"
if [ "$test" = "1" ]; then
  backend_config="$backend_config --env-file ./test/test.env"
fi
configs="$configs $backend_config"

if [ "$webserver" = "caddy" ]; then
  webserver_config="-f ./docker/caddy/docker-compose.caddy.yml"
  configs="$configs $webserver_config"
fi

add_service_configs() {
  local service=$1
  configs="$configs -f ./docker/docker-compose.${service}.yml"
  if [ "$test" = "1" ]; then
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

if [ "$test" = "1" ]; then
  test_config="-f ./test/docker-compose.test.yml"
  configs="$configs $test_config"
fi

echo "$configs"