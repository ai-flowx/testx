#!/bin/bash

pushd source || exit 0
npm install -g nexe
npx nexe --build \
  -r drizzle/ -r package.json -r "dist/**/*" -r "node_modules/**/*" \
  -i dist/src/main.js \
  -o testx-linux-x64
popd || exit 0
