#!/bin/bash
# ./smileat.sh /dev/pts/2 10
#
# w
#
# disguise yourself
# wall -n sup
#

smile(){
	if [ ! -d /tmp/node_modules/cool-ascii-faces ]; then
		npm install --prefix /tmp cool-ascii-faces > /dev/null
	fi
	node /tmp/node_modules/cool-ascii-faces/cli.js
}



for ((n=0;n<$2;n++)); do
	echo $'\n'`smile`$'\n' > $1
done