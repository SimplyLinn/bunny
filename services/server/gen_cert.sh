#!/bin/bash

# Use openssl to create a self-signed cert and key for local development
# Optional: add cert.cert to your locally trusted root
# (usually double clicking it will work, google otherwise)
openssl req -x509 -out ./src/config/localhost.cert -keyout ./src/config/localhost.key \
  -newkey rsa:2048 -nodes -sha256 \
  -subj '/CN=localhost' -extensions EXT -config <( \
   printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")

echo "Generated src/localhost.cert, src/localhost.key"