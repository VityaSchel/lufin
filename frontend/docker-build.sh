#!/bin/bash

set -e

if test -z "$API_URL"; then
  echo "You must set the API_URL environment variable"
  exit 1
fi

(cd ../lib && ./docker-build.sh)
docker volume rm -f lufin_frontend || true
docker build -t lufin/frontend:latest . --build-arg API_URL="${API_URL}" --build-arg PUBLIC_ADMIN_EMAIL="${PUBLIC_ADMIN_EMAIL}"
docker run --rm -v lufin_frontend:/usr/src/app/dist lufin/frontend:latest
