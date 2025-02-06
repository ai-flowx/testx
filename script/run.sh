#!/bin/bash

pushd source || exit 0
# npm run dev
# npm run local -- eval --no-progress-bar --no-table -c /path/to/config.yml -o /path/to/output.html
npm run local -- eval --config examples/cloudflare-ai/chat_config.yaml
popd || exit 0
