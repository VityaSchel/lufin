#!/bin/bash

set -e

if [ ! -f "data-retention.config.json" ]; then
  if [ ! -f "data-retention.config.example.json" ]; then
    echo "Error: neither backend/data-retention.config.json nor backend/data-retention.config.example.json exist" >&2
    exit 1
  fi
  cp data-retention.config.example.json data-retention.config.json
  echo "==============================================="
  echo "☝️ Created backend/data-retention.config.json from example. Review and edit it manually if needed."
  echo "==============================================="
fi  

docker build -t lufin/backend:latest .