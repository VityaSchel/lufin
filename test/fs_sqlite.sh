docker compose -f docker-compose-backend.yml -f docker-compose-fs.yml -f docker-compose-sqlite.yml -f docker-compose-test.yml up --build --abort-on-container-exit --exit-code-from test
exit_code=$?
docker compose -f docker-compose-backend.yml -f docker-compose-fs.yml -f docker-compose-sqlite.yml -f docker-compose-test.yml down --volumes
exit $exit_code