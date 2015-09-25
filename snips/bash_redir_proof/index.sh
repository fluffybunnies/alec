#!/bin/bash
# ./index.sh 2>&1 > /dev/null
#

cd "`dirname $0`"

./throws.sh 2>&1 > ./bad.log~
# vs
./throws.sh > ./good.log~ 2>&1

