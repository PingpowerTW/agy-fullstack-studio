#!/usr/bin/env bash
# run node db migration validator
node "$(dirname "$0")/validate-db-migrations.js" "$@"
