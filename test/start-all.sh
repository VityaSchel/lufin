set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$SCRIPT_DIR/.."

storages=(s3 fs)
dbs=(postgres mongo sqlite)

for storage in "${storages[@]}"; do
  for db in "${dbs[@]}"; do
    configs=$(./get-docker-compose-params.sh "$storage" "$db" test)
    docker compose $configs up --build --abort-on-container-exit --exit-code-from test
    exit_code=$?
    docker compose $configs down --volumes
    if [ $exit_code -ne 0 ]; then
      echo "Tests failed for storage: $storage, db: $db"
      exit $exit_code
    fi
  done
done