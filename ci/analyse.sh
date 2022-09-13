#! /bin/bash

# Run all lint tasks
sh ci/lint.sh || exit 1

# Run all UI tests
sh ci/test-ui.sh || exit 1

# Run all API unit and behaviour tests
sh ci/test-api.sh || exit 1

# Assess code coverage quality
sh ci/check-coverage.sh || exit 1