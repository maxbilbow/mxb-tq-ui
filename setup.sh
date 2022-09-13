#!/bin/bash

curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
apt-get update
apt-get install -y nodejs

deno upgrade

deno task build