#!/bin/bash

pushd source || exit 0
npm run format
npm run lint
popd || exit 0
