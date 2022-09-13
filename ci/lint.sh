#! /bin/bash
Red='\033[0;31m'       
Green='\033[0;32m'
On_Purple='\033[45m'   
NC='\033[0m' # No Color

printf "${On_Purple}Running static analysis on API${NC}\n"
deno lint --config deno.json || exit 1

printf "${On_Purple}Running static analysis on SPA${NC}\n"
cd spa && npm run lint && cd .. || exit 1
