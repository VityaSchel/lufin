set -e

storages=(s3 fs)
dbs=(postgres mongo sqlite)

for storage in "${storages[@]}"; do
  for db in "${dbs[@]}"; do
    ./start.sh "$storage" "$db"
  done
done