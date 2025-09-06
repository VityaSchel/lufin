#!/bin/sh

storage=$1
db=$2

if [ "$storage" = "s3" ]; then
  storage_compose="../docker-compose.s3.yml"
  storage_compose_test_override="./docker-compose.override.s3-test.yml"
elif [ "$storage" = "fs" ]; then
  storage_compose="../docker-compose.fs.yml"
  storage_compose_test_override="./docker-compose.override.fs-test.yml"
else
  echo "Error: Invalid storage type. Use 's3' or 'fs'." >&2
  exit 1
fi

if [ "$db" = "mongo" ]; then
  db_compose="../docker-compose.mongodb.yml"
  db_compose_test_override="./docker-compose.override.mongodb-test.yml"
elif [ "$db" = "postgres" ]; then
  db_compose="../docker-compose.postgresql.yml"
  db_compose_test_override="./docker-compose.override.postgresql-test.yml"
elif [ "$db" = "sqlite" ]; then
  db_compose="../docker-compose.sqlite.yml"
  db_compose_test_override="./docker-compose.override.sqlite-test.yml"
else
  echo "Error: Invalid database type. Use 'mongo', 'postgres' or 'sqlite'." >&2
  exit 1
fi

# TODO: add flag for testing to conditionally add override.*-test configs and -f docker-compose-test.yml
# then move ./start.sh script to project root and put snippet to call it with a test flag in test subdirectory
configs = "-f ../backend/docker-compose.yml -f $storage_compose -f $storage_compose_test_override -f $db_compose -f $db_compose_test_override -f docker-compose-test.yml"

docker compose "$configs" up --build --abort-on-container-exit --exit-code-from test
exit_code=$?
docker compose "$configs" down --volumes
exit $exit_code