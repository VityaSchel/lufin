#!/bin/bash

set -euo pipefail

if [ $# -eq 0 ]; then
  echo "Usage: $0 <start | stop | permadel | reload>" >&2
  exit 1
fi

cmd=$1
shift || true

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd $SCRIPT_DIR

get_compose_params() {
  if [ ! -f .env ]; then
    echo "Error: .env file not found. You may need to run ./generate-env.sh first." >&2
    exit 1
  fi

  storage=$(grep '^STORAGE_TYPE=' .env | cut -d '=' -f2)
  db=$(grep '^DB_TYPE=' .env | cut -d '=' -f2)
  api_url=$(grep '^API_URL=' .env | cut -d '=' -f2)
  if [ -z "$storage" ] || [ -z "$db" ] || [ -z "$api_url" ]; then
    echo "Error: STORAGE_TYPE, DB_TYPE or API_URL not set in .env file. You may need to run ./generate-env.sh first." >&2
    exit 1
  fi
  admin_email=$(grep '^PUBLIC_ADMIN_EMAIL=' .env | cut -d '=' -f2)

  caddy_https_port=$(grep '^CADDY_HTTPS_PORT=' .env | cut -d '=' -f2)

  if ! (cd ./lib && ./docker-build.sh); then
    echo "Error building lib" >&2
    exit 1
  fi
  
  if ! (cd ./frontend && API_URL=$api_url PUBLIC_ADMIN_EMAIL=$admin_email ./docker-build.sh); then
    echo "Error building frontend" >&2
    exit 1
  fi

  if [ -n "$caddy_https_port" ]; then
    https_flag="--https"
  else
    https_flag=""
  fi

  configs=$(./get-docker-compose-params.sh --storage "$storage" --db "$db" --caddy $https_flag)

  COMPOSE_PARAMS="--env-file .env $configs"
}

case "$cmd" in
  start)
    get_compose_params || exit $?
    docker compose $COMPOSE_PARAMS up -d --build
    ;;
  stop)
    get_compose_params || exit $?
    docker compose $COMPOSE_PARAMS down
    ;;
  permadel)
    get_compose_params || exit $?
    docker compose $COMPOSE_PARAMS down --volumes
    ;;
  reload)
    get_compose_params || exit $?
    docker compose $COMPOSE_PARAMS down
    docker compose $COMPOSE_PARAMS up -d --build
    ;;
  *)
    echo "Usage: $0 <start | stop | permadel | reload>" >&2
    ;;
esac
