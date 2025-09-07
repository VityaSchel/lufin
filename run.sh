#!/bin/bash

set -euo pipefail

if [ $# -eq 0 ]; then
  echo "Usage: $0 <start | stop | reload>" >&2
  exit 1
fi

cmd=$1
shift || true


get_compose_params() {
  if [ ! -f .env ]; then
    echo "Error: .env file not found. You may need to run ./generate-env.sh first." >&2
    exit 1
  fi

  storage=$(grep '^STORAGE_TYPE=' .env | cut -d '=' -f2)
  db=$(grep '^DB_TYPE=' .env | cut -d '=' -f2)
  if [ -z "$storage" ] || [ -z "$db" ]; then
    echo "Error: STORAGE_TYPE or DB_TYPE not set in .env file. You may need to run ./generate-env.sh first." >&2
    exit 1
  fi

  ./build-lib.sh
  ./get-docker-compose-params.sh "$storage" "$db"
}

case "$cmd" in
  start)
    compose_params=$(get_compose_params) || exit $?
    docker compose $compose_params up -d --build
    ;;
  stop)
    compose_params=$(get_compose_params) || exit $?
    docker compose $compose_params down --volumes
    ;;
  reload)
    compose_params=$(get_compose_params) || exit $?
    docker compose $compose_params down
    docker compose $compose_params up -d --build
    ;;
  *)
    echo "Usage: $0 <start | stop | reload>" >&2
    ;;
esac
