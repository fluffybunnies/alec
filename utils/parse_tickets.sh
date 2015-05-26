#!/bin/bash
# ./parse_tickets.sh v0.3.163_release..v0.3.179_release
#

# @todo: match alternate patterns like will's patch-1234
out=
tins=`git log --pretty=format:%s $1 | sed -En 's/.*[tT][lL][gG]-?([0-9]+).*/\1/gp'`
for tin in $tins; do
	if [ "${saved[$tin]}" == "" ]; then
		tid="TLG-$tin"
		if [ "$out" == "" ]; then out=$tid; else out=$out'\n'$tid; fi
		saved[tin]=1
	fi
done
echo -e $out | sort
