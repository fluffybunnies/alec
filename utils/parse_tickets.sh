#!/bin/bash
# ./run.sh v0.3.163_release..v0.3.179_release
#
# @todo: try just sedding this cuz this loop is sloooow
# echo -e "[TLG-1234] stuff\n[TLG-5678] more stuff" | sed -E -n 's/.*(TLG-[0-9]+).*/\1/gp'
#


isInt(){
	int='^[0-9][0-9]*$'
	if [[ "$1" =~ $int ]]; then
		echo 1
	fi
}


out=
log=`git log --pretty=format:%s $1 | sed -E -n 's/.*(TLG-[0-9]+).*/\1/gp'`
for line in $log; do
	lineN=`echo $line | sed -E -n 's/TLG-([0-9]+)$/\1/gp'`
	if [ "${saved[$lineN]}" == "" ]; then
		out=$out'\n'$line
		saved[line]=1
	fi
done
echo
echo -e $out | sort
exit


log=`git log --pretty=format:%s $1`

#exit
#real	0m2.895s
#user	0m1.205s
#sys	0m1.660s

out=
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
			#echo $buf
			echo -n '.'
			out=$out'\n'$buf
			bufs[bufN]=1
		fi
		buf=
		bufN=
	fi
done
echo
echo -e $out | sort
