#!/bin/bash

set -e

if [ ! -f "data-retention.config.json" ]; then
  cp data-retention.config.example.json data-retention.config.json
  echo "==============================================="
  echo "☝️ Created backend/data-retention.config.json from example. Review and edit it manually if needed."
  echo "==============================================="
fi

docker build -t lufin/backend:latest .