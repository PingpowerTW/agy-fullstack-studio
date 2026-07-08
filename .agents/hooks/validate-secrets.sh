#!/usr/bin/env bash
# run node secrets scanner
node "$(dirname "$0")/validate-secrets.js" "$@"
