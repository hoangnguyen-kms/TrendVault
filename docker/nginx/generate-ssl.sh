#!/bin/sh
# Generate self-signed SSL certificate for local/staging use
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SSL_DIR="$SCRIPT_DIR/ssl"

mkdir -p "$SSL_DIR"

openssl req -x509 -nodes -days 365 \
  -newkey rsa:2048 \
  -keyout "$SSL_DIR/trendvault.key" \
  -out "$SSL_DIR/trendvault.crt" \
  -subj "/CN=trendvault.local"

echo "SSL certificate generated at $SSL_DIR/"
