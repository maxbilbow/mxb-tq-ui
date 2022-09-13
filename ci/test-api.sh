#! /bin/bash

profile_dir=.tmp/cov_profile
reports_dir=reports/coverage

echo "Removing old reports"
rm -rf ${profile_dir}
rm -rf ${reports_dir}

echo "Running API tests with coverage profile"
deno test api/test/api  --allow-all --unstable --import-map importmap.json --coverage=${profile_dir} || exit 1

echo "Generating profile lcov"
deno coverage ${profile_dir} --exclude="api/test" --lcov --output=${profile_dir}/profile.lcov

echo "Generating coverage report html in ${reports_dir}"
coverage=`genhtml -o ${reports_dir} ${profile_dir}/profile.lcov`
coverage=(`grep -oEA 2 "([0-9][0-9].[0-9]|[0-9][0-9]|100)%" <<< "$coverage"`)

line_coverage=${coverage[0]%"%"}
function_coverage=${coverage[1]%"%"}

echo "Line coverage: ${line_coverage}%"
echo "Function coverage: ${function_coverage}%"

echo "Cleaning up temporary files"

rm -rf "${profile_dir}"

echo "::set-output name=lines::${line_coverage}"
echo "::set-output name=functions::${function_coverage}"

