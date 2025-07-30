#!/bin/bash
#
#	cd [to repo]
#	~/Dropbox/alec_repo/utils/parse_tickets.sh 20151221dg_release..20151221dke_release
#
#	~/Dropbox/alec_repo/utils/parse_tickets.sh 20151022d_release..20151103PAYn_release | xargs -0 bash -i -c pmo
#
#	git log --pretty=format:%s 20151006kn_release..20151015d_release | sed -En 's/.*([0-9]{8,9}).*/\1/gp'
#
#	Place PIVOTAL_API_TOKEN and PIVOTAL_PROJECT_ID in ~/.secrets to format list like "- [#ID] NAME"
#
#	To Do
# 	- When appending "#updates" to ticket, format commit messages with newlines + tabs + dashes
#		- Ticket title gets cut off if double quote exists
# 	- Ignore commits like "commit c991d622f21c9e228556722f509a768d1d49a2dc"
# 	- Support Github Issues
# 	- Fix issue when quotes are in ticket name (ends up being "Quote begins with \n[#106253960] Next Ticket Name"
#


cd "`pwd`"

commits=$1
if [ ! "$1" ]; then
	>&2 echo 'missing args'
	exit 1
fi
commit0=`echo "$commits" | sed 's/\(.*\)\.\..*/\1/'`
commit1=`echo "$commits" | sed 's/.*\.\.//'`
if [ ! "$commit0" -o ! "$commit1" ]; then
	>&2 echo "invalid format"
	exit 1
fi

out=
#tins=`git log --pretty=format:%s $1 | sed -En 's/.*[tT][lL][gG]-?([0-9]+).*/\1/gp'`
#tins=`git log --pretty=format:%s $1 | sed -En 's/.*\[#?([0-9]+)\].*/\1/gp'` # misses "commit for 394850384 task"
#tins=`git log --pretty=format:%s $1 | sed -En 's/[^0-9]*([0-9]{8,9}).*/\1/gp'` # misses "1st commit [394850384]"
# 10/19/2015 dont have time to figure out cases this misses, swapped out in favor of second one above
tins=`git log --pretty=format:%s $1 | sed -En 's/.*([0-9]{9}).*/\1/gp'` # {8,9} isnt greedy, end up with stuff like "05699832"
if [ ! "$PIVOTAL_API_TOKEN" -o ! "$PIVOTAL_PROJECT_ID" ]; then
	echo "https://www.pivotaltracker.com/story/show/"
fi
for tin in $tins; do
	#echo "tin: $tin"
	if [ "${saved[$tin]}" == "" ]; then
		#tid="TLG-$tin"
		tid="#$tin"
		if [ "$2" != "--raw" ] && [ "$PIVOTAL_API_TOKEN" ] && [ "$PIVOTAL_PROJECT_ID" ]; then
			ticketName=`curl -sS -X GET -H "X-TrackerToken: $PIVOTAL_API_TOKEN" "https://www.pivotaltracker.com/services/v5/projects/$PIVOTAL_PROJECT_ID/stories/$tin" | \
			perl -pe 's|.*?"name":"([^"]*)".*|\1|'`
			tid="- [#$tin] $ticketName"
		fi
		if [ "`git log $commit0 | grep $tin`" ]; then
			tid="$tid #updates"
			#tid="$tid ("`git log $commit1 | grep $tin`")"
		fi
		if [ "$out" == "" ]; then out=$tid; else out=$out'\n'$tid; fi
		saved[tin]=1
	fi
done
echo -e $out | sort

