#!/bin/bash

set -e

services=(agent audit-log auth customer email-service shopkeeper)

targets="node18-linux-x64"

mkdir -p bin

for service in "${services[@]}"; do
  pkg ./dist/$service/main.js --targets $targets --output ./bin/$service
done

