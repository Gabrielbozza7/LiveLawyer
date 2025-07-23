#!/bin/bash

RETURN_PATH="$PWD"

EXTRA_IP=`head -n 1 "$REPOSITORY_ROOT""/.devcontainer/ip.txt"`
echo "NOTE: Extra domain to be used: $EXTRA_IP"

cd "$REPOSITORY_ROOT"
mkdir "certificates"
cd "certificates"
mkcert create-ca --organization "Live Lawyer - Testing" --country-code "US" --state "New Jersey" --locality "Newark"
mkcert create-cert --organization "Live Lawyer - Testing" --domains "localhost" "127.0.0.1" "$EXTRA_IP"

cd "$RETURN_PATH"
