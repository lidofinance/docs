#!/bin/sh
set -eu

# Source vault-injected secrets if present (K8s openbao/vault agent)
[ -f /vault/secrets/auth ] && . /vault/secrets/auth

: "${BASIC_AUTH_USER:?BASIC_AUTH_USER env var is required}"
: "${BASIC_AUTH_PASS:?BASIC_AUTH_PASS env var is required}"

printf '%s' "$BASIC_AUTH_PASS" | htpasswd -ci /tmp/.htpasswd "$BASIC_AUTH_USER"
chmod 600 /tmp/.htpasswd

exec nginx -g 'daemon off;'
