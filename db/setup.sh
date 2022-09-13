#!/usr/bin/env bash

if [ "$1" = "--empty" ]; then
    echo "Creating empty database"
    mysql -uroot -pp455w0rd < /scripts/create.sql
else
    echo "Creating database with sample data"
    mysql -uroot -pp455w0rd < /scripts/create.sql
fi

echo "Adding API user to database"
# mysql -uroot -pp455w0rd < /scripts/users.sql