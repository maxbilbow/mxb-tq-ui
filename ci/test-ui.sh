#! /bin/bash

# PUPPETEER_PRODUCT=chrome deno run -A --unstable https://deno.land/x/puppeteer@9.0.2/install.ts

echo "Running UI Tests"
deno test api/test/ui/ --allow-all --unstable --import-map importmap.json
