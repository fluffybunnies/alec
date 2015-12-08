#!/bin/bash
#
#	cd [to repo]
#	~/Dropbox/alec_repo/utils/parse_tickets.sh 20151117nabi_release..20151117nabv_release
#
#	~/Dropbox/alec_repo/utils/parse_tickets.sh 20151022d_release..20151103PAYn_release | xargs -0 bash -i -c pmo
#
#	git log --pretty=format:%s 20151006kn_release..20151015d_release | sed -En 's/.*([0-9]{8,9}).*/\1/gp'
#
#	Place PIVOTAL_API_TOKEN and PIVOTAL_PROJECT_ID in ~/.secrets to format list like "- [#ID] NAME"
#
#	To Do
#		- Ticket title gets cut off if double quote exists
#

cd "`pwd`"

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
		if [ "$out" == "" ]; then out=$tid; else out=$out'\n'$tid; fi
		saved[tin]=1
	fi
done
echo -e $out | sort

