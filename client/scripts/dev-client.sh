#! /usr/bin/env bash

(
    trap 'kill 0' SIGINT
    python -m http.server --directory assets &
    npm run build:client:css -- --watch &
    npm run build:client -- --watch --outdir=assets &
    wait
)
