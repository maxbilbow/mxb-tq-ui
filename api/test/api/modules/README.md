
# Testing The Routes

This directory contains **integration tests** for the different routes in the API.

Each collection has a separate test script which contains tests for the:

- collection.
- resources in that collection.

The tests can be run using the following command:

```
$ deno test --allow-all --import-map importmap.json api/test/ 
```
