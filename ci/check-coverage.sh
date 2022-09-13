#! /bin/bash
Red='\033[0;31m'       
Green='\033[0;32m'
On_Purple='\033[45m'   
NC='\033[0m' # No Color

printf "${On_Purple}evaluating code coverage results${NC}\n"
high_coverage_count=`grep -ow headerCovTableEntryHi reports/coverage/index.html | wc -l`

if [ $high_coverage_count -ne 2 ]
then
    printf "${Red}Coverage is too low! Lines & Functions must be > 90%. Check report for more info${NC}\n"
    exit 42
else
    printf "${Green}Coverage is good!${NC}\n"
    exit 0
fi