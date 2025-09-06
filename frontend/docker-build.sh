if test -z "$API_URL"; then
  echo "You must set the API_URL environment variable"
  exit 1
fi
if test -z "$PUBLIC_ADMIN_EMAIL"; then
  echo "You must set the PUBLIC_ADMIN_EMAIL environment variable"
  exit 1
fi
if test ! -z "$(docker images -q lufin/lib)"; then
  docker build -t lufin/frontend:latest . --build-arg API_URL="${API_URL}" --build-arg PUBLIC_ADMIN_EMAIL="${PUBLIC_ADMIN_EMAIL}"
else
  echo "You must build lufin/lib first"
fi
