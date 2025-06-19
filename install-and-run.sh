#!/usr/bin/env bash

set -e

REPO_URL="https://github.com/Ayush-Vish/RuralSync-API.git"
APP_DIR="RuralSync-API"

sudo apt update -y
sudo apt upgrade -y

sudo apt install -y docker.io

sudo usermod -aG docker $USER

sudo apt install -y docker-compose

git clone "$REPO_URL"

cd "$APP_DIR"

docker-compose up -d --build
