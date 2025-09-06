#!/bin/sh
set -euo pipefail

cmd=$1
shift || true

case "$cmd" in
  up)
    docker compose $(./get-docker-compose-params.sh "$@") up -d
    ;;
  down)
    docker compose $(./get-docker-compose-params.sh "$@") down --volumes
    ;;
  reload)
    docker compose $(./get-docker-compose-params.sh "$@") down
    docker compose $(./get-docker-compose-params.sh "$@") up -d
    ;;
  test)
    docker compose $(./get-docker-compose-params.sh "$@") up --build --abort-on-container-exit --exit-code-from test
    exit_code=$?
    docker compose $(./get-docker-compose-params.sh "$@") down --volumes
    exit $exit_code
    ;;
  *)
    docker compose $(./get-docker-compose-params.sh "$cmd" "$@") up -d
    ;;
esac
