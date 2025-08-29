docker compose -f docker-compose-s3-postgresql.test.yml up --build --abort-on-container-exit --exit-code-from test
exit_code=$?
docker compose -f docker-compose-s3-postgresql.test.yml down --volumes
exit $exit_code