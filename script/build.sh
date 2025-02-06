#!/bin/bash

pushd source || exit 0
# npm install
npm run build
popd || exit 0
