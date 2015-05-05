#!/bin/bash
# ./run.sh v0.3.163_release..v0.3.179_release
#
# @todo: try just sedding this cuz this loop is sloooow
# sed -n -E '/.*\(TLG-[0-9]+\).*/\1/p' $log
# echo $log | sed -n -E '/.*\(TLG\-[0-9]+\).*/X/p'
#


isInt(){
	int='^[0-9][0-9]*$'
	if [[ "$1" =~ $int ]]; then
		echo 1
	fi
}


log=`git log --pretty=format:%s $1`
log=`echo $log | sed -E -e 's/[^TLG0-9\-]+/ /g'`

exit

#exit
#real	0m2.895s
#user	0m1.205s
#sys	0m1.660s

len=${#log}
for ((i=0;i<$len;++i)); do
	c=${log:$i:1}
	l=${#buf}
	if ([ "$c" == 'T' ] && [ $l -eq 0 ])\
		|| ([ "$c" == 'L' ] && [ $l -eq 1 ])\
		|| ([ "$c" == 'G' ] && [ $l -eq 2 ])\
		|| ([ "$c" == '-' ] && [ $l -eq 3 ]); then
		buf=$buf$c
	elif [ `isInt $c` ] && [ $l -gt 3 ]; then
		buf=$buf$c
		bufN=$bufN$c
	else
		if [ $l -gt 4 ] && [ "${bufs[$bufN]}" == "" ]; then
			echo $buf
			bufs[bufN]=1
		fi
		buf=
		bufN=
	fi
done

