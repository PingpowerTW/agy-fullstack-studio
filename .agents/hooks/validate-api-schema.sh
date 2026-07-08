#!/usr/bin/env bash
# run node api schema validator
node "$(dirname "$0")/validate-api-schema.js" "$@"
