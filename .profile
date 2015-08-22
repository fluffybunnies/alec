
# elastic beanstalk
export PATH=$PATH:/Users/ahulce/AWS-ElasticBeanstalk-CLI-2.6.3/eb/macosx/python2.7

# MacPorts Installer addition on 2012-02-29_at_15:43:38: adding an appropriate PATH variable for use with MacPorts.
#export PATH=/opt/local/bin:/opt/local/sbin:/usr/local/share/npm/bin:$PATH
# 20150307 - Uninstalled homebrew's installation of npm and installed it next to node in /usr/local/bin/
# This means 2 of the dirs above are now empty. @todo: See if I can remove MacPorts altogether
export PATH=/opt/local/bin:$PATH
# Finished adapting your PATH environment variable for use with MacPorts.

#pcre
export PATH=/usr/local/pcre/bin:$PATH

#gitawareprompt
export GITAWAREPROMPT=~/.bash/git-aware-prompt
source $GITAWAREPROMPT/main.sh
export PS1="\u@\h \w \[$txtcyn\]\$git_branch\[$txtred\]\$git_dirty\[$txtrst\]\$ "
#end gitawareprompt

# stop merge message prompt
export GIT_MERGE_AUTOEDIT=no

# php
export PATH=/usr/local/php5/bin:$PATH

# mysql
export PATH=/usr/local/mysql/bin:$PATH

# lein
export PATH=~/bin:$PATH

# for: grep, topen, etc
export DEFAULT_TEXT_APP='/Applications/Sublime Text 2.app'
export DEFAULT_WEB_APP='/Applications/Google Chrome.app'

saveprofile()(
	src='/Users/ahulce/.profile'
	dest='/Users/ahulce/Dropbox/alec_repo/.profile'
	ls -lh "$dest"
	cp "$src" "$dest"
	ls -lh "$dest"
)

#alias smile="curl http://smiley.meatcub.es:1337"
smile(){
	if [ ! -d /tmp/node_modules/cool-ascii-faces ]; then
		npm install --prefix /tmp cool-ascii-faces > /dev/null
	fi
	node /tmp/node_modules/cool-ascii-faces/cli.js
}

echocute(){
	echo $1
	eval "$1"
}

poo(){
	# Push changes to current branch
	# poo optional message
	#
	currentBranch=`git branch | grep '*' | head -n1 | sed -n 's/^\* //p'`
	msg="$@"
	if [ "$msg" == "" ]; then msg=`smile`; fi
	git add --all .
	git commit -a -m "$msg"
	git pull origin $currentBranch
	git push origin $currentBranch
}

pop(){
	# Merge master into prod and push prod up
	#
	git fetch
	git checkout prod
	git pull origin prod
	git merge master && git push origin prod && git checkout master
}

mastit(){
	# Sync current branch with origin master
	#
	currentBranch=$1
	if [ "$currentBranch" == "" ]; then
		currentBranch=`git branch | grep '*' | head -n1 | sed -n 's/^\* //p'`
	fi
	echo "current branch: $currentBranch"
	echocute 'git checkout master'
	echocute 'git fetch'
	echocute 'git pull origin master'
	echocute "git checkout $currentBranch"
	echocute "git merge master && git push origin $currentBranch"
	echocute 'git diff master...'
}

mastif(){
	# Sync local branch with origin. Defaults to master
	# mastif patch-brownies
	#
	branch=$1
	if [ "$branch" == "" ]; then
		branch='master'
	fi
	echocute "git fetch && git checkout $branch && git pull origin $branch && git fetch --tags"
}

gcp(){
	git cherry-pick $1
}

bitch() {
	if [[ $1 -eq "please" ]]; then
		eval "sudo $(fc -ln -1)"
	else
		sudo "$@"
	fi
}

grepl() ( # <- for ulimit + local vars
	# grep the last N lines of file, defaults to last 10 lines
	# grepl -R '?>' ./
	# grepl -1 -R '?>' ./
	# grepl -3 -R '?>' ./ | xargs topen
	#
	searchIn=./
	searchLast=10
	for arg in "$@"; do
		if [ $arg == '-r' -o $arg == '-R' ]; then recursive='-r'
		elif [[ "$arg" =~ ^-[0-9]+$ ]]; then searchLast=`echo "$arg" | sed "s/^-//"`
		elif [ ! "$search" ]; then search=$arg
		elif [ ! "$searchIn" ]; then searchIn=$arg
		else args="$args $arg"; fi
	done
	if [ ! "$search" ]; then
		>&2 echo "please provide a search value"
	else
		ulimit -n 5000
		grep -lI $recursive "$search" "$searchIn" 2>/dev/null | xargs tail -$searchLast | grep -B$searchLast "$search" | grep '==> .* <==' | sed 's/==> \(.*\) <==/\1/'
	fi
)

gropen() {
	# Stream open files matched with grep
	# gropen -R 'interesting text' ./
	#
	if [ "$1" == "" ]; then
		# we just grepped but really wish we had gropened instead...
		prevCmd="$(fc -ln -1)"
		if [ "`echo \"$prevCmd\" | grep '|'`" ]; then
			cmd=`echo "$prevCmd" | sed -n 's/grep/gropenList/p'`
		else
			cmd=`echo "$prevCmd" | sed -n 's/grep/gropen/p'`
		fi
		eval "$cmd"
	else
		grep -l --line-buffered "$@" | xargs -n1 open -a"$DEFAULT_TEXT_APP"
	fi
}

gropenList(){
	# For use by gropen() if passing a stream of path strings instead of grepping files
	# The same except for no '-l' option
	#
	grep --line-buffered "$@" | xargs -n1 open -a"$DEFAULT_TEXT_APP"
}

gropen2() {
	# old way, waits till the end before opening
	#
	_IFS=$IFS
	IFS=$'\n'
	g=`grep -l "$@"`
	for file in $g; do
		open $file
	done
	IFS=$_IFS
}

fsh() {
	# Ssh with pem file
	#
	ip=$1
	user=$2
	if [ "$user" == "" ]; then
		user='ec2-user'
	fi
	if [ "$ip" == "" ]; then
		echo "please supply an ip"
	else
		ssh -i/Users/ahulce/.ssh/fabfitfun2.pem -oStrictHostKeyChecking=no $user@"$ip"
	fi
}

myec2() {
	# Ssh to primary instance. Instance set in hosts file: myec2 123.123.123.123
	#
	ip=`cat /etc/hosts | grep myec2 | head -n1 | awk '{print $1}'`
	if [ "$ip" == "" ]; then
		echo "requires 'myec2' entry in /etc/hosts"
	else
		echocute "ssh -t $@ ubuntu@$ip 'sudo -i'"
		#c='cd /root/sire'
		#c="cd /var/www"
		#ssh -t ubuntu@$ip "sudo -i su -c '$c; /bin/bash'"
	fi
}

get_current_tag()(
	url=$1/id
	cnf=`curl -sS "$url"`
	echo $cnf | sed -n 's/.*"tag":"\([^"]*\).*/\1/p'
)

wag_instance()(
	d=$1
	if [ "$d" == "-s" ]; then d=$2; fi
	if [ "$d" == "dev1" ]; then d=54.152.199.226
	elif [ "$d" == "dev2" ]; then d=52.4.9.222
	elif [ "$d" == "stage" ]; then d=54.172.164.179
	elif [ "$d" == "qa" ] || [ "$d" == "prelease" ]; then d=54.152.18.15
	elif [ "$d" == "scripts" ]; then d=50.18.217.82
	elif [ "$d" == "prod" ]; then d=54.67.7.34
	fi
	echo $d
)

shudo() {
	# Same as: ssh ubuntu@instance, sudo -i, cd to web directory
	# shudo ec2-107-20-26-208.compute-1.amazonaws.com
	#
	d=$1
	s='2>/dev/null'
	c="cd /var/www && cd api_internal $s || cd platform-v2 $s || cd wordpress $s || cd lucky-forwarder $s || cd lucky-bak $s && cd current $s"
	t="sudo -i su -c '$c; /bin/bash'"
	
	# begin waglabs
	# This works once inside: [ -d /var/www ] && su ubuntu -c 'cd /var/www; /bin/bash'
	#c="$c; [ -d /var/www/html/wag_api ] && su - ubuntu -c 'cd /var/www/html/wag_api; /bin/bash'"
	# Unknown id: /var/www/html/wag_api
	d=`wag_instance "$d"`

	if [ "$d" == "54.152.199.226" -o "$d" == "52.4.9.222" -o "$d" == "54.172.164.179" -o "$d" == "54.152.18.15" -o "$d" == "54.67.7.34" ]; then
		t="cd /var/www/html/wag_api; /bin/bash"
	fi
	echo "$d"
	if [ "$1" != "-s" ] && [ "$2" != "-s" ]; then
		ssh -t ubuntu@$d $t
	fi
	# end waglabs

	#ssh -t ubuntu@$d $t
}

shtag_head()(
	# Create tag off HEAD and push to env
	# Note: this does some weird stuff when using --git-dir. everything seems to end up ok if i run git reset at the end.
	#	though i havent had time to figure out the weirdness yet.
	# shtag_head qa
	#
	# git tag -d 20150821e_release && git push origin :refs/tags/20150821e_release
	#
	env=`wag_instance $1`
	currentTag=`get_current_tag $env`
	letter=`echo $currentTag | sed 's/[0-9]*\([a-z]\).*/\1/'`
	if [ ! "$letter" ] || [ "$letter" == 'z' ]; then
		>&2 echo "unable to create next tag; letter: $letter" # @todo: continue on past z
		exit 1
	fi
	abc=(a b c d e f g h i j k l m n o p q r s t u v w x y z)
	i=0
	for l in ${abc[@]}; do
			i=$[i+1]
			if [ $letter == $l ]; then break; fi
	done
	nextLetter=${abc[$i]}
	nextTag=`echo $currentTag | sed "s/$letter/$nextLetter/"`
	git tag $nextTag || exit 1
	git push --tags || exit 1
	gitDir=/var/www/html/wag_api/.git # different from prod so we dont accidentally push to live
	#echo "ssh ubuntu@$env \"git --git-dir=$gitDir fetch --tags && git --git-dir=$gitDir checkout $nextTag\""
	ssh ubuntu@$env "git --git-dir=$gitDir fetch --tags && git --git-dir=$gitDir checkout $nextTag && git --git-dir=$gitDir reset --hard HEAD" || exit 1
	echo "pushed $nextTag to $env"
)

shelease() {
	# Deploy a tag to multiple instances
	# shelease v0.3.152_release-fbs-dev ec2-54-82-41-81.compute-1.amazonaws.com ec2-54-147-31-5.compute-1.amazonaws.com
	#
	commit=$1
	s='2>/dev/null'
	c="cd /var/www || exit; cd api_internal $s || cd platform-v2 $s || cd wordpress $s || exit; cd current || exit"
	r="git fetch && git fetch --tags && git checkout $commit"
	dir=`pwd`
	if [ "`basename $dir`" == "platform-v2-lucky" ]; then
		r="$r && restart platform-v2 && sleep 1 && /etc/init.d/varnish restart"
	fi
	for arg in "$@"; do
		if [ $arg == "$commit" ]; then continue; fi
		echo $arg
		ssh -t ubuntu@$arg "sudo -i su -c '$c; $r'"
	done
}

topen() {
	# Open a file for editing, creating it if not exists
	# topen newfile.txt
	#
	if [ "$1" != "" ]; then
		mkdir -p `dirname "$1"`
		touch "$1"
		open -a"$DEFAULT_TEXT_APP" "$1"
	fi
}

wopen() {
	open -a"$DEFAULT_WEB_APP" "$1"
}

bopen() {
	topen "$1"
	wopen "$1"
}

authme() {
	# Give yourself root access
	# authme ec2-54-159-48-203.compute-1.amazonaws.com
	#
	#ubuntuAuthKey=/Users/ahulce/.ssh/mac.pem
	ubuntuAuthKey=/Users/ahulce/.ssh/wag-api-test.pem
	serverName=$1
	if [ "$1" == "prod" ]; then
		ubuntuAuthKey=/Users/ahulce/.ssh/wagprod2.pem
		serverName=$2
	fi
	pubKey=`cat ~/.ssh/id_rsa.pub | sed -n 's/\(.*\) .*$/\1/p'`
	if [ "`ssh -oStrictHostKeyChecking=no ubuntu@$serverName 'echo "ok"'`" != "ok" ]; then
		echo "pushing pubKey for ubuntu..."
		ssh -i$ubuntuAuthKey ubuntu@$serverName "echo '$pubKey' >> ~/.ssh/authorized_keys"
	elif [ "`ssh -oStrictHostKeyChecking=no root@$serverName 'echo "ok"'`" != "ok" ]; then
		echo "pushing pubKey for root..."
		ssh ubuntu@$serverName "echo '$pubKey' | sudo tee -a /root/.ssh/authorized_keys > /dev/null"
	else
		echo "already authed"
	fi
}

shep() {
	# Copy local file to remote
	# Set remote: shep set ec2-54-159-58-209.compute-1.amazonaws.com
	# Copy file: shep docroot/lucky/wp-content/test.txt
	#
	remotePrefix=/var/www/
	sourceFile=`realpath "$1" 2>/dev/null`
	path=$sourceFile
	mem=/tmp/shep_addr
	remoteAppName=
	remotePath=
	addr=`cat "$mem" 2>/dev/null`
	if [ "$1" == "set" ]; then
		echo "$2" > "$mem"
	elif [ "$1" == "get" ] || [ "$1" == "" ]; then
		echo "$addr"
	elif [ "$addr" == "" ]; then
		echo "use shep set <addr> to set a remote address"
	elif [ "$1" == "-a" ]; then
		echo "shepping all modified files..."
		files=`git ls-files -m`
		for file in $files; do
			if [ "$file" != "-a" ]; then # avoid recursion
				echo "$file..."
				shep "$file"
			fi
		done
	else
		while [ "$path" != "" ] && [ "$path" != "/" ]; do
			dir=`basename "$path"`
			if [ "$dir" == "lucky_wordpress" ]; then
				remoteAppName='wordpress'
			elif [ "$dir" == "magento19_api" ]; then
				remoteAppName='api_internal'
			elif [ "$dir" == "magento19" ]; then
				remoteAppName='magento'
			fi
			if [ "$remoteAppName" != "" ]; then
				remotePath=`echo "$sourceFile" | sed -n "s/.*\/$dir\(.*\)\$/$remoteAppName\/current\1/p"`
				#echo "scp \"$sourceFile\" \"root@$addr:$remotePrefix$remotePath\""
				r=`scp "$sourceFile" "root@$addr:$remotePrefix$remotePath" 2>&1`
				#echo "$r"
				r=`echo "$r" | grep 'Permission denied (publickey)'`
				if [ "$r" != "" ]; then
					echo "$r"
					echo "authorizing..."
					authme $addr
					echo "retrying..."
					sleep 1
					shep $@
				fi
				break
			fi
			path=`dirname "$path"`
		done
	fi
}

shrestart() {
	# Restart Pv3 instance from local
	# shrestart ec2-54-145-59-103.compute-1.amazonaws.com
	# shrestart ec2-54-145-59-103.compute-1.amazonaws.com -c v0.3.232_release-1
	#
	instance=$1
	args=
	skipFirst=1
	mem=/tmp/shrestart_addr
	for arg in "$@"; do
		if [ $skipFirst == 0 ]; then
			if [ "$args" == "" ]; then args=$arg; else args=$args" $arg"; fi
		else
			((skipFirst--))
		fi
	done
	if [ "$instance" == "" ]; then
		args=`cat "$mem" 2>/dev/null`
		if [ "$args" != "" ]; then
			echo "no addr supplied, using previous: shrestart $args"
			shrestart $args
		else
			echo "no addr supplied"
		fi
	else
		exec 5>&1
		r=`ssh root@$instance "cd /var/www/platform-v2/current && /bin/bash ./restart.sh $args" 2>&1 | tee /dev/fd/5`
		r=`echo "$r" | grep 'Permission denied (publickey)'`
		if [ "$r" != "" ]; then
			echo "authorizing..."
			authme $instance
			echo "retrying..."
			sleep 1
			shrestart $@
		fi
		echo "$@" > "$mem"
	fi
}

wclear(){
	# Clear laravel cache
	# wclear
	# wclear -a
	#
	if [ -d ./app/storage ]; then
		rm -fr ./app/storage/cache/* ./app/storage/meta/* ./app/storage/views/*
		if [ "$1" == "-a" ]; then
			rm -fr ./app/storage/logs/* ./app/storage/sessions/*
		fi
	else
		>&2 echo './app/storage is not a directory'
	fi
}

if [ "`which realpath`" == "" ]; then
	realpath() {
		if [ ! -f "$1" ] && [ ! -d "$1" ]; then
			>&2 echo 'path does not exist'
		else
			dir=$1
			if [ -f "$1" ]; then
				dir=`dirname "$1"`
			fi
			path=`cd "${dir}";pwd`
			if [ -f "$1" ]; then
				path=$path/`basename "$1"`
			fi
			echo $path
		fi
	}
fi

gp(){
	if [ "$1" ]; then
		gitp_cwd=`pwd`
		cd "$1"
		time (mastif && git gc)
		cd "$gitp_cwd"
	else
		ls
	fi
}

if [ -f /tmp/start.sh ]; then
	./tmp/start.sh
fi

# zat (app maker for zendesk) doesnt like echoes in .profile
#echo "yay profile"
