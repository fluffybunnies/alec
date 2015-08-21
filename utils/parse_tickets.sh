#!/bin/bash
#	cd [to repo]
#	~/Dropbox/alec_repo/utils/parse_tickets.sh 20150805l_release..20150815p_release
#

cd "`pwd`"

out=
#tins=`git log --pretty=format:%s $1 | sed -En 's/.*[tT][lL][gG]-?([0-9]+).*/\1/gp'`
tins=`git log --pretty=format:%s $1 | sed -En 's/.*\[#?([0-9]+)\].*/\1/gp'` # misses "commit for 394850384 task"
#tins=`git log --pretty=format:%s $1 | sed -En 's/[^0-9]*([0-9]{8,9}).*/\1/gp'` # misses "1st commit [394850384]"
echo "https://www.pivotaltracker.com/story/show/"
for tin in $tins; do
	#echo "tin: $tin"
	if [ "${saved[$tin]}" == "" ]; then
		#tid="TLG-$tin"
		tid="#$tin"
		if [ "$out" == "" ]; then out=$tid; else out=$out'\n'$tid; fi
		saved[tin]=1
	fi
done
echo -e $out | sort

