#!/bin/bash

echo "Create rsa key pairs for jwt, if not exist already"

if [ ! -f ./private.pem ]; then

    echo "Generate Private Key"

    openssl genrsa -passout pass:f0a37270-d510-11e7-8dad-d412dd2004b7 -out ./private.pem -aes256 4096

    echo "Generate Public Key"

    openssl rsa -passin pass:f0a37270-d510-11e7-8dad-d412dd2004b7 -pubout -in ./private.pem -out ./public.pem

else

    echo "Keys already exist. Skip generation..."

fi