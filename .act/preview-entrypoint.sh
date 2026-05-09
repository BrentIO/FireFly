#!/bin/bash
set -e

cd /docs

echo "==> Cleaning previous build..."
rm -rf .vitepress/dist .vitepress/cache

echo "==> Installing dependencies..."
npm install

echo "==> Generating PlantUML diagrams..."
find . -name "*.puml" -not -path "./node_modules/*" -print0 | while IFS= read -r -d '' f; do
    dir=$(dirname "$f")
    base=$(basename "$f")
    (cd "$dir" && plantuml -tsvg "$base")
    echo "    Generated: ${f%.puml}.svg"
done

echo "==> Downloading OpenAPI specs..."
mkdir -p public/openapi
curl -sSf "https://raw.githubusercontent.com/BrentIO/FireFly-Controller/main/Controller/openapi.yaml" \
    -o public/openapi/controller.yaml
curl -sSf "https://raw.githubusercontent.com/BrentIO/FireFly-Controller/main/Hardware-Registration-and-Configuration/openapi.yaml" \
    -o public/openapi/hardware-registration.yaml
curl -sSf "https://raw.githubusercontent.com/BrentIO/FireFly-Cloud/main/docs/openapi.yaml" \
    -o public/openapi/cloud.yaml

echo "==> Downloading AsyncAPI spec..."
mkdir -p public/asyncapi
curl -sSf "https://raw.githubusercontent.com/BrentIO/FireFly-Controller/main/Controller/asyncapi.yaml" \
    -o public/asyncapi/controller.yaml

echo "==> Copying AsyncAPI web component..."
cp node_modules/@asyncapi/web-component/lib/asyncapi-web-component.js public/asyncapi/web-component.js
cp node_modules/@asyncapi/react-component/styles/default.min.css public/asyncapi/default.min.css

echo "==> Copying static assets..."
find . \( -name "*.svg" -o -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" -o -name "*.webp" \) \
    -not -path "./public/*" \
    -not -path "./node_modules/*" \
    -not -path "./.vitepress/*" | while read -r asset; do
    dest="public/${asset#./}"
    mkdir -p "$(dirname "$dest")"
    cp "$asset" "$dest"
done

echo "==> Building VitePress site..."
CONFIGURATOR_URL="http://localhost" npm run docs:build

echo "==> Build complete. Serving on http://localhost:4173 ..."
node_modules/.bin/vitepress preview --host 0.0.0.0 --port 4173
