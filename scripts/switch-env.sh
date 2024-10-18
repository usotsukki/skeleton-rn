#!/bin/bash

ENV_FILE=".env"

if [ "$1" == "testing" ]; then
  ENV_FILE=".env.testing"
elif [ "$1" == "dev" ]; then
  ENV_FILE=".env.dev"
elif [ "$1" == "production" ]; then
  ENV_FILE=".env.production"
fi

echo "Using environment file: $ENV_FILE"

cp $ENV_FILE .env

echo "✅ Environment file switched."