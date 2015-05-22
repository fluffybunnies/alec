
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

# mysql
export PATH=/usr/local/mysql/bin:$PATH

# lein
export PATH=~/bin:$PATH

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
	#
	currentBranch=`git branch | grep '*' | head -n1 | sed -n 's/^\* //p'`
	msg="$@"
	if [ "$msg" == "" ]; then
		msg=`smile`
	fi
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
	currentBranch=`git branch | grep '*' | head -n1 | sed -n 's/^\* //p'`
	echo "current branch: $currentBranch"
	echocute 'git checkout master'
	echocute 'git fetch'
	echocute 'git pull origin master'
	echocute "git checkout $currentBranch"
	echocute "git merge master && git push origin $currentBranch"
}

bitch() {
	if [[ $1 -eq "please" ]]; then
		eval "sudo $(fc -ln -1)"
	else
		sudo "$@"
	fi
}

gropen() {
	# Stream open files matched with grep
	# gropen -R 'interesting text' ./
	#
	app='/Applications/Sublime Text 2.app'
	grep -l --line-buffered "$@" | xargs -n1 open -a"$app"
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
	# Ssh with pem file without
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

shudo() {
	# Same as: ssh ubuntu@instance, sudo -i, cd to web directory
	# shudo ec2-107-20-26-208.compute-1.amazonaws.com
	#
	s='2>/dev/null'
	c="cd /var/www && cd api_internal $s || cd platform-v2 $s || cd wordpress $s && cd current"
	ssh -t ubuntu@$1 "sudo -i su -c '$c; /bin/bash'"
}

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
		app='/Applications/Sublime Text 2.app'
		mkdir -p `dirname "$1"`
		touch $1
		open -a"$app" $1
	fi
}

authme() {
	# Give yourself root access
	# authme ec2-54-159-48-203.compute-1.amazonaws.com
	#
	serverName=$1
	if [ "`ssh -oStrictHostKeyChecking=no root@$serverName 'echo "ok"'`" != "ok" ]; then
		echo "pushing pubKey..."
		pubKey=`cat ~/.ssh/id_rsa.pub | sed -n 's/\(.*\) .*$/\1/p'`
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
					shep $@
				fi
				break
			fi
			path=`dirname "$path"`
		done
	fi
}

if [ "`which realpath`" == "" ]; then
	realpath() {
		if [ ! -f "$1" ] && [ ! -d "$1" ]; then
			>&2 echo 'path does not exist'
		else
			dir=`dirname "$1"`
			path=`cd "${dir}";pwd`
			if [ -f "$1" ]; then
				path=$path/`basename "$1"`
			fi
			echo $path
		fi
	}
fi


# zat (app maker for zendesk) doesnt like echoes in .profile
#echo "yay profile"
