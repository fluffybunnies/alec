if [ -f ~/.secrets ]; then
	. ~/.secrets
fi

# Setting PATH for Python 3.4
export PATH="/Library/Frameworks/Python.framework/Versions/3.4/bin:${PATH}"

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
#export PATH=~/bin:$PATH

### Added by the Heroku Toolbelt
#export PATH="/usr/local/heroku/bin:$PATH"

if [ -d /usr/local/phpunit-git-deploy/bin ]; then export PATH=/usr/local/phpunit-git-deploy/bin:$PATH; fi

# increase max-files-open
ulimit -Sn 2048
#ulimit -S -u 1024 # <-- careful with this one


# for: grep, topen, etc
DEFAULT_TEXT_APP='/Applications/Sublime Text 2.app'
DEFAULT_WEB_APP='/Applications/Google Chrome.app'



# BEGIN docker init
docker_init(){
	while getopts 'f' opt; do
		case $opt in
			f)
				docker_init_FORCE=1
			;;
		esac
	done

	if [ -f "$docker_init_lockFile" ] && [ ! "$docker_init_FORCE" ]; then
		echo "docker_init:: lock file detected, exiting"
		return
	fi
	if [ ! "`which docker-machine`" ]; then
		>&2 echo "docker_init:: docker-machine not found in PATH, exiting"
		return
	fi

	docker_init_lockFile=/tmp/docker_init
	if [ -f "$docker_init_lockFile" ] && [ ! "$docker_init_FORCE" ]; then
		echo "docker_init:: lock file detected, not checking docker server"
	elif [ "`docker version 2>&1 | grep 'Cannot connect to the Docker daemon. Is the docker daemon running on this host'`" ]; then
		date > "$docker_init_lockFile"
		echo "docker_init:: cannot detect docker server, attempting boot"
		docker-machine start
		rm "$docker_init_lockFile"
	fi

	env="$(docker-machine env)"
	echo "docker:: checking env vars look ok..."
	looksGood=1
	while IFS= read -r line; do
		if [[ $line != \#* ]] && [[ $line != export\ * ]]; then
			echo "docker_init:: line: $line"
			looksGood=0
		fi
	done <<< "$env"

	if [ $looksGood == 1 ]; then
		echo "docker_init:: evaling env vars to set up parent proc"
		eval "$(docker-machine env)"
	else
		echo "docker_init:: env vars look fishy. not evaling"
		echo
		echo "$(docker-machine env)"
		echo
	fi
}
docker_init
# END docker init




saveprofile()(
	src='/Users/ahulce/.profile'
	dest='/Users/ahulce/Dropbox/alec_repo/.profile'
	ls -lh "$dest"
	cp "$src" "$dest"
	ls -lh "$dest"
)

rprofile(){
	# reload this file
	. ~/.profile
}

pmo()(
	# @todo: if input is git commit, parse out pivotal ticket number
	# positiveInt='^[1-9][0-9]*$'; if ! [[ "$1" =~ $positiveInt ]]; then ...
	tid=$1
	if [ "${tid:0:1}" == '#' ]; then
		tid=${tid:1}
	fi
	open -a"$DEFAULT_WEB_APP" "https://www.pivotaltracker.com/story/show/$tid"
)

opem()(
	# cuz i suck at typing
	open $@
)

#alias smile="curl http://smiley.meatcub.es:1337"
smile(){
	if [ ! -f /tmp/node_modules/cool-ascii-faces/cli.js ]; then
		#rm -fr /tmp/node_modules/cool-ascii-faces
		npm install --prefix /tmp cool-ascii-faces > /dev/null
	fi
	node /tmp/node_modules/cool-ascii-faces/cli.js
}

echocute(){
	echo $1
	eval "$1"
}

gca()(
	# Same as git commit -a -m "message"
	#
	#
	msg="$@"
	if [ ! "$msg" ]; then
		>&2 echo "Please supply a commit message"
		exit
	fi
	git commit -a -m "$msg"
)

poo()(
	# Push changes to current branch
	# poo optional message
	#
	currentBranch=`git branch | grep '*' | head -n1 | sed -n 's/^\* //p'`
	msg="$@"
	if [ "$msg" == "" ]; then msg=`smile`; fi
	git add --all .
	git commit -a -m "$msg"
	git pull origin $currentBranch #|| exit 1 # commented out so we can push new branches at the cost of missing potential merge conflict
	git push origin $currentBranch
)

pop()(
	# Merge master into prod and push prod up
	#
	git fetch
	git checkout prod
	git pull origin prod
	git merge master && git push origin prod && git checkout master
)

mastit()(
	# Sync current branch with origin master
	#
	currentBranch=$1
	if [ "$currentBranch" == "" ]; then
		currentBranch=`git branch | grep '*' | head -n1 | sed -n 's/^\* //p'`
	fi
	echo "current branch: $currentBranch"
	git checkout master || exit 1
	git fetch
	git pull origin master || exit 1
	(git checkout $currentBranch && git merge master && git push origin $currentBranch) || exit 1
	echo 'git diff master...'
	git --no-pager diff master
)

mastif()(
	# Sync local branch with origin. Defaults to master
	# mastif patch-brownies
	#
	branch=$1
	if [ "$branch" == "" ]; then
		branch='master'
	fi
	echocute "git fetch && git checkout $branch && git pull origin $branch && git fetch --tags"
)

gcp()(
	# Same as git cherry-pick COMMIT
	# gcp 79d675c4704a81d86cfb17987209087c6a52fe60
	#
	git fetch
	if [ ! "$1" ]; then
		>&2 echo 'Please supply a commit to cherry-pick'
		exit
	fi
	git cherry-pick $1
)

gco()(
	branch=$1
	if [ ! "$branch" ]; then
		branch=`git branch | grep '*' | head -n1 | sed -n 's/^\* //p'`
		if [ "`echo $branch | grep 'detached from'`" ]; then
			branch=`git describe --tags`
		fi
	fi
	#git fetch && git fetch --tags && git reset --hard origin/$branch && git checkout -f $branch && git pull origin $branch
	# the above doesnt work with tags. for now i dont have a way to guarantee the targeted commit will be checked out
	#		i.e. origin/TAG is not recognized, so i cant reset my local based on remote for tags, so i could get stuck with both modified and unable to checkout -f
	echocute "git fetch && git fetch --tags && git reset --hard origin/HEAD && git checkout -f $branch && git pull origin $branch"
)

gcb()(
	# Same as git checkout -b patch-NAME
	# gcb puppies
	#
	name=$1
	if [ ! "$name" ]; then
		#name=happies # @todo: randomize
		name=`smile`
	fi
	mastif master && git checkout -b patch-$1 # && git push origin +patch-$1 # << might want this last bit so things dont get jacked when you `poo`
)

glc(){
	if [ `which pbcopy` ]; then
		git log $1 | head -n1 | awk '{print $2}' | pbcopy
	fi
	git log $1 | head -n5
}

gbb()(
	git checkout -
)

gbd()(
	# Delete a branch if the last commit is in master
	# gbd patch-sql-updates
	#
	branch=$1
	if [ ! "$branch" ]; then
		>&2 echo 'branch required' 
		exit 1
	fi
	lastCommitIsInMaster=`git log master | grep \`git log "$branch" | head -n1 | awk '{print $2}'\``
	if [ "$lastCommitIsInMaster" ]; then
		# delete branch
		echo "deleting $branch"
		git branch -D "$branch"
	fi
)

gdel()(
	# Delete all merged branches (locally)
	# gdel
	#
	git branch
	#if [ "$1" == "-f" ]; then
	#	git branch | xargs git branch -D
	#else
		git branch | xargs git branch -d
	#fi
	git branch
)

bitch() {
	if [[ $1 -eq "please" ]]; then
		eval "sudo $(fc -ln -1)"
	else
		sudo "$@"
	fi
}

grepv()(
	# grep excluding common directories
	#
	grep $@ | grep -v 'node_modules/\|.git/'
)

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

gropen()(
	# Stream open files matched with grep
	# gropen -R 'interesting text' ./
	# @todo: make this work for any list of files, e.g. git diff --name-only 20150821za_release..20150923m_release app/database/
	# 	or e.g. grep -Ri 'get' app/controllers/ | grep 's(' | grep public | grep ApiController
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
)

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

fsh()(
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
)

myec2()(
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
)

get_current_tag()(
	url=$1/id
	cnf=`curl -sS "$url"`
	echo $cnf | sed -n 's/.*"tag":"\([^"]*\).*/\1/p'
)

name_to_ip()(
	d=$1
	if [ "$d" == "-s" ]; then d=$2; fi
	if [ "$d" == "dev1" ]; then d=54.164.7.90
	elif [ "$d" == "dev2" ]; then d=52.4.9.222
	elif [ "$d" == "dev3" ]; then d=54.172.115.236 # old: d=54.165.251.139
	elif [ "$d" == "dev4" ]; then d=54.175.47.224
	elif [ "$d" == "dev5" ]; then d=54.86.134.253
	elif [ "$d" == "uat" ]; then d=54.84.201.95 # old: d=54.152.199.226
	elif [ "$d" == "stage" -o "$d" == "stage-prod" ]; then d=52.23.225.118 # old: 54.172.164.179
	elif [ "$d" == "qa" ]; then d=52.91.3.22 # old: d=52.23.156.43 # old: d=54.152.18.15
	elif [ "$d" == "prod" ]; then d=54.67.7.34
	elif [ "$d" == "scripts" ]; then d=54.183.79.4
	elif [ "$d" == "scripts-old" ]; then d=50.18.217.82
	fi
	echo $d
)

shudo()(
	# Same as: ssh ubuntu@instance, sudo -i, cd to web directory
	# shudo ec2-107-20-26-208.compute-1.amazonaws.com
	#
	d=$1
	if [ "$1" == "-s" -o "$1" == "-u" ]; then d=$2; fi
	s='2>/dev/null'
	c="cd /var/www && cd wagapi $s || cd api_internal $s || cd platform-v2 $s || cd wordpress $s || cd lucky-forwarder $s || cd lucky-bak $s && cd current $s"
	#t="sudo -i su -c '$c; /bin/bash'"
	t='sudo -i' # su -c no longer allows interactive shells, which is annoying when ctrl+c destroys your connection. instead, push your cd command to /root/.bashrc
	if [ "$1" == "-u" ]; then t="$c; /bin/bash"; fi
	
	d=`name_to_ip "$d"`
	echo "$d"
	if [ "$1" != "-s" ] && [ "$2" != "-s" ]; then
		ssh -t ubuntu@$d $t
	fi
)

shtag_head()(
	# Create tag off HEAD and push to env
	# @todo: If tag has already been cut (i.e. last tag == HEAD), then just push it to env
	# shtag_head qa
	#
	# git tag -d 20150821g_release && git push origin :refs/tags/20150821g_release
	#
	env=`name_to_ip $1`
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
	gitDir=/var/www/html/wag_api # different from prod so we dont accidentally push to live
	remoteCnf="--git-dir=$gitDir/.git --work-tree=$gitDir"
	ssh ubuntu@$env "git $remoteCnf fetch --tags && git $remoteCnf checkout $nextTag" || exit 1
	echo "pushed $nextTag to $env"
)

shelease()(
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
)

topen()(
	# Open a file for editing, creating it if not exists
	# topen dir/that/not/exist/newfile.txt
	#
	if [ "$2" ]; then
		for arg in "$@"; do
			topen "$arg"
		done
		exit
	fi
	if [ "$1" ]; then
		if [ ! -f "$1" ]; then
			mkdir -p "$(dirname "$1")"
			touch "$1"
		fi
		open -a"$DEFAULT_TEXT_APP" "$1"
	fi
)

wopen()(
	# Open a file in your default web browser
	# wopen dir/that/not/exist/webpage.html
	#
	open -a"$DEFAULT_WEB_APP" "$1"
)

bopen() {
	# Open a file in your browser and text editor
	# Useful if your default application for an .html or .php is your text editor but you want to open it in your browser as well to view
	#
	topen "$1"
	wopen "$1"
}

watch()(
	/Users/ahulce/Dropbox/Beachmint/watchs/index.js $@
)

authme()(
	# Give yourself root access
	# authme ec2-54-159-48-203.compute-1.amazonaws.com
	#
	#ubuntuAuthKey=/Users/ahulce/.ssh/mac.pem
	ubuntuAuthKey=/Users/ahulce/.ssh/wag-api-test.pem
	serverName=`name_to_ip $1`
	if [ "$1" == "prod" -o "$1" == "scripts" -o "$1" == "scripts-old" ]; then
		ubuntuAuthKey=/Users/ahulce/.ssh/wagprod2.pem
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
)

shep()(
	# Copy local file to remote
	# Set remote: shep set ec2-54-159-58-209.compute-1.amazonaws.com
	# Copy file: shep docroot/lucky/wp-content/test.txt
	#
	remoteServer=`name_to_ip $2`
	remotePrefix=/var/www/
	sourceFile=`realpath "$1" 2>/dev/null`
	path=$sourceFile
	mem=/tmp/shep_addr
	remoteAppName=
	remotePath=
	addr=`cat "$mem" 2>/dev/null`
	if [ "$1" == "set" ]; then
		echo "$remoteServer" > "$mem"
	elif [ "$1" == "get" ] || [ "$1" == "" ]; then
		echo "$addr"
	elif [ "$addr" == "" ]; then
		echo "use shep set <addr> to set a remote address"
	elif [ "$1" == "-a" -o "$2" ]; then
		if [ "$1" == "-a" ]; then
			echo "shepping all modified files..."
			files=`git ls-files -m`
		else
			echo "shepping several files..."
			files="$@"
		fi
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
			elif [ "$dir" == "wagapi" ]; then
				remoteAppName='wagapi'
			elif [ "$dir" == "raptor" ]; then
				remoteAppName='raptor'
			fi
			if [ "$remoteAppName" != "" ]; then
				# beachmint: (prepends current/)
				#remotePath=`echo "$sourceFile" | sed -n "s/.*\/$dir\(.*\)\$/$remoteAppName\/current\1/p"`
				remotePath=`echo "$sourceFile" | sed -n "s/.*\/$dir\(.*\)\$/$remoteAppName\1/p"`
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
)

shrestart()(
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
)

tardir()(
	# Tar+Zip contents of large directory
	# tardir path/to/dir path/to/archive
	#
	# Omit second argument to target cwd
	# tardir path/to/dir
	#
	source=$1
	target=$2
	if [ "$1" == '-x' ]; then
		source=$2
		target=$3
		untardir "$2" "$3"
		exit
	fi
	if [ ! "$target" ]; then target=`pwd`/`basename "$source"`.tar.gz; # tardir /tmp
	elif [ -d "$target" ]; then target=`cd "$target";pwd`/`basename "$source"`.tar.gz; # tardir /tmp ../
	fi

	curdir=`pwd`
	cd "$source"
	includeFile=`mktemp -t tartmp.XXXXXX`
	find . -type f > "$includeFile"

	tar -T "$includeFile" -zcf "$target"

	rm "$includeFile"
	cd "$curdir"
)

untardir()(
	# Untar+unzip archive
	# tardir path/to/archive.tar.gz path/to/target/dir
	#
	# Omit second argument to target cwd
	# untardir path/to/archive.tar.gz
	#
	source=$1
	target=$2
	if [ ! "$target" ]; then target=./; fi

	tar -zxf "$source" -C "$target"
)

mysqlc()(
	# MAMP...
	#mysql -h127.0.0.1 -proot -uroot --port=8889 wagapi -A
	mysql -uroot -A
)

mysqlq()(
	# mysqlq 'show create table owner' | grep app_version
	# @todo: convert '\n' to newline - currently not working
	# @todo: update config.sh to set and reset pwd
	#
	#. ~/Dropbox/wag/wagapi/config.sh
	cd ~/Dropbox/wag/wagapi
	. ./config.sh
	if [ "$mysqlPort" ]; then port=" --port=$mysqlPort"; fi
	#echo "$@" | mysql -h$mysqlHost $port -u$mysqlUser -p$mysqlPass $mysqlDb -A
	#echo "$@" | mysql -h$mysqlHost $port -u$mysqlUser -p$mysqlPass $mysqlDb -A | tr '\\\n' $'\n'
	echo "$@" | mysql -h$mysqlHost $port -u$mysqlUser -p$mysqlPass $mysqlDb -A | tr '\\\n' $'\n'
)

escape_bash_val()(
	# echo '$wef="w\$ef"' | sed 's/\(["$\]\)/\\\1/g'
	echo "$1" | sed 's/\(["$\]\)/\\\1/g'
)

pushsql(){
	where="$1"
	if [ ! "$where" ]; then
		where='qa'
	fi
	bak=`find ~/Downloads/ | grep wag.prod | tail -n1`
	if [ ! "$bak" ]; then
		>&2 echo 'cant find bak file in ~/Downloads/'
		exit
	fi
	echo "pushing $bak to $where:/tmp/"
	scp "$bak" ubuntu@`shudo -s "$where"`:/tmp/
}

pushbash()(
	# Push DEV.bashrc to remote
	# pushbash stage-prod
	# pushbash dev1 dev2 dev3 uat qa stage-prod
	#
	localRc=/Users/ahulce/Dropbox/wag/chef-deploy/tools/files/DEV.bashrc
	remoteRc=/root/.bashrc
	localTools=/Users/ahulce/Dropbox/wag/chef-deploy/tools/files/DEV.wagtools
	remoteTools=/root/.wagtools
	if [ "$1" == "prod" -o "$1" == "scripts" ]; then
		localRc=/Users/ahulce/Dropbox/wag/chef-deploy/tools/files/PROD.bashrc
		localTools=/Users/ahulce/Dropbox/wag/chef-deploy/tools/files/PROD.wagtools
	fi

	if [ "$2" ]; then
		for arg in "$@"; do
			pushbash $arg
		done
		exit
	fi

	remote=`name_to_ip $1`

	scp "$localTools" "root@$remote:'$remoteTools'"
	
	tmp1=`mktemp -t pushbash.XXXXXX`
	tmp2=`mktemp -t pushbash.XXXXXX`
	scp "root@$remote:'$remoteRc'" "$tmp1"
	lineNum=`cat "$tmp1" | grep -n '# wag stuff' | head -n1 | sed 's/\([0-9]*\).*/\1/g'`
	if [ "$lineNum" ]; then
		head -n$((lineNum-2)) "$tmp1" > "$tmp2"
	else
		cat "$tmp1" > "$tmp2"
		echo $'\n\n' >> "$tmp2"
	fi
	ssh root@$remote "cp -n '$remoteRc' '$remoteRc.pushbash.bak'"
	ssh root@$remote "cp -n '$remoteRc' '/tmp/pushbash.$(date +%Y%m%d_%H%M%S).bak'"
	cat "$localRc" >> "$tmp2"
	scp "$tmp2" "root@$remote:'$remoteRc'"
	rm "$tmp1"
	rm "$tmp2"
	echo "pushed to $1"
)

if [ "`which realpath`" == "" ]; then
	realpath()(
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
	)
fi

gp()(
	if [ "$1" ]; then
		gitp_cwd=`pwd`
		cd "$1"
		time (mastif && git gc)
		cd "$gitp_cwd"
	else
		ls
	fi
)


dockersql()(
	~/Dropbox/urbankitchens/util/docker/dev_mysql.sh
)


dockercc()(
	# Stop and remove docker containers
	# Pass -i to also remove all images
	#
	# Remove all docker containers: dockercc
	# Remove all docker containers and images: dockercc -i
	# Remove specific container: dockercc api
	#
	# @todo: Grab container-image link in case image isn't named the same as SPECIFIC_CONTAINER
	#
	if [ "$1" == "-i" ] || [ "$2" == "-i" ]; then REMOVE_IMAGES=1; fi
	if [ "$1" ] && [[ $1 != \-* ]]; then SPECIFIC_CONTAINER="$1";
	elif [ "$2" ] && [[ $2 != \-* ]]; then SPECIFIC_CONTAINER="$2"; fi

	if [ "$SPECIFIC_CONTAINER" ]; then
		echo "stopping + removing container $SPECIFIC_CONTAINER"
		docker rm -f "$SPECIFIC_CONTAINER"
		if [ "$REMOVE_IMAGES" == 1 ]; then
			imgId=`docker images | grep "$SPECIFIC_CONTAINER " | awk '{print $3}'`
			echo "WARNING! Removing image $SPECIFIC_CONTAINER ($imgId) in 3 seconds. Press ctrl+c to cancel"
			sleep 3
			docker rmi $imgId
		fi
	else
		echo "stopping + removing ALL containers"
		docker rm -f $(docker ps -a -q)
		if [ "$REMOVE_IMAGES" == 1 ]; then
			echo "WARNING! Removing all images in 3 seconds. Press ctrl+c to cancel"
			sleep 3
			docker rmi $(docker images -q)
		fi
	fi
)

dockersh()(
	# Shortcut for connecting to active docker container
	#
	# dockersh CONTAINER_NAME
	#
	docker exec -ti "$1" /bin/bash
)

dockergits()(
	# Sync instance with git
	# Uses local keys for verification, removing them from instance when done
	#
	# dockergits CONTAINER_NAME
	# 	CONTAINER_NAME tries to guess if empty (optional)
	# 	-i path to key for git, tries ~/.ssh/id_rsa if empty (optional)
	# 	-k leave your ssh keys on the VM (optional)
	#

	dockerContainer=`last_plain_arg $@`
	# try and guess dockerContainer
	if [ ! "$dockerContainer" ]; then
		cwd=$(basename $(pwd))
		if [ "$cwd" == 'be' -a "`docker ps --format '{{.Names}}' 2>/dev/null | grep nodejs`" == 'nodejs' ]; then dockerContainer=nodejs;
		elif [ "$cwd" == 'fe' -a "`docker ps --format '{{.Names}}' 2>/dev/null | grep react`" == 'react' ]; then dockerContainer=react;
		elif [ "$cwd" == 'fe' -a "`docker ps --format '{{.Names}}' 2>/dev/null | grep mysql-magento-1`" == 'mysql-magento-1' ]; then dockerContainer=mysql-magento-1; fi
		if [ "$dockerContainer" ]; then echo "dockerContainer not supplied as argument, guessing \"$dockerContainer\""; fi
	fi
	if [ ! "$dockerContainer" ]; then >&2 echo 'Please supply docker container as first argument'; exit; fi

	while getopts ':ik' opt; do
		case $opt in
			i)
				PUB_KEY_PATH=$OPTARG
			;;
			k)
				KEEP_SSH_KEYS=1
			;;
		esac
	done

	echo "Finding local repo context..."
	currentBranch=`git rev-parse --abbrev-ref HEAD`
	if [ ! "$currentBranch" ]; then >&2 echo 'Unable to identify current branch. Is your cwd a git repo?'; exit; fi

	echo "Finding remote dir..."
	lookIn=/home/ubuntu/dev
	remoteDir=`docker exec $dockerContainer /bin/bash -c "ls $lookIn 2>/dev/null | head -n1"`
	if [ ! "$remoteDir" ]; then >&2 echo "Unable to identify remote directory in $lookIn"; exit; fi
	remoteDir=$lookIn/"$remoteDir"

	echo "Copying ssh keys..."
	docker_copy_ssh_keys $dockerContainer $PUB_KEY_PATH

	echo "Adding git's public key to known_hosts..."
	docker exec $dockerContainer /bin/bash -c 'ssh -oStrictHostKeyChecking=no git@github.com'

	echo "Attempting to simulate git repo..."
	gitConfig=`cat ./.git/config`
	#if [ ! "`docker exec $dockerContainer /bin/bash -c 'ls -d '$remoteDir/.git' 2>/dev/null'`" ]; then
		docker exec $dockerContainer /bin/bash -c "cd '$remoteDir'; git init; echo '$gitConfig' > .git/config; chmod 0644 .git/config"
	#fi

	echo "Syncing branch $currentBranch..."
	# _temp_ branch is so `git pull` doesnt create a merge commit and subsequently require auth
	docker exec $dockerContainer /bin/bash -c "cd '$remoteDir'; git fetch; git checkout -f -b _temp_; git checkout -f _temp_; git branch -D $currentBranch; git checkout -f $currentBranch; git branch -D _temp_;"

	if [ "`docker exec $dockerContainer ls -f $remoteDir/scripts/dev_restart.sh 2>/dev/null`" ]; then
		echo "Running scripts/dev_restart.sh..."
		docker exec $dockerContainer $remoteDir/scripts/dev_restart.sh
	fi

	if [ ! "$KEEP_SSH_KEYS" ]; then
		echo "Cleaning up ssh keys..."
		docker_clean_ssh_keys $dockerContainer
	fi
)


docker_copy_ssh_keys()(
	# Note this really should be used programmatically in conjunction with docker_clean_ssh_keys()
	# Why? Cuz docker_clean_ssh_keys() assumes docker_copy_ssh_keys() was just run. Could overwrite keys otherwise.
	# @todo: Enforce this by using a $RANDOM key to create tmpbaks, which docker_clean_ssh_keys() will require as arg
	#
	dockerContainer=$1
	PUB_KEY_PATH=$2
	if [ ! "$dockerContainer" ]; then >&2 echo "Please supply a dockerContainer as first argument"; exit; fi
	if [ ! "$PUB_KEY_PATH" ]; then PUB_KEY_PATH=~/.ssh/id_rsa; fi # @todo: there's got to be a way to commandeer `ssh`'s findBestKey() logic
	machineSshKeyPrivate=`cat "$PUB_KEY_PATH"`
	machineSshKeyPublic=`cat "$PUB_KEY_PATH.pub"`
	docker exec $dockerContainer sudo /bin/bash -c 'if [ -f /root/.ssh/id_rsa ]; then mv /root/.ssh/id_rsa /root/.ssh/id_rsa.tmpbak; fi'
	docker exec $dockerContainer sudo /bin/bash -c 'if [ -f /root/.ssh/id_rsa.pub ]; then mv /root/.ssh/id_rsa.pub /root/.ssh/id_rsa.pub.tmpbak; fi'
	docker exec $dockerContainer /bin/bash -c "echo '$machineSshKeyPrivate' > /root/.ssh/id_rsa"
	docker exec $dockerContainer /bin/bash -c "echo '$machineSshKeyPublic' > /root/.ssh/id_rsa.pub"
	docker exec $dockerContainer /bin/bash -c 'chmod 0400 /root/.ssh/id_rsa'
)


docker_clean_ssh_keys()(
	dockerContainer=$1
	if [ ! "$dockerContainer" ]; then >&2 echo "Please supply a dockerContainer as first argument"; exit; fi
	docker exec $dockerContainer sudo /bin/bash -c 'rm /root/.ssh/id_rsa; rm /root/.ssh/id_rsa.pub'
	docker exec $dockerContainer sudo /bin/bash -c 'if [ -f /root/.ssh/id_rsa.tmpbak ]; then mv /root/.ssh/id_rsa.tmpbak /root/.ssh/id_rsa; fi'
	docker exec $dockerContainer sudo /bin/bash -c 'if [ -f /root/.ssh/id_rsa.pub.tmpbak ]; then mv /root/.ssh/id_rsa.pub.tmpbak /root/.ssh/id_rsa.pub; fi'
)


last_plain_arg()(
	for arg in $@; do
		if [[ $arg != \-* ]]; then lastArg=$arg; fi
	done
	echo $lastArg
)

npv()(
	# Return version of package in ./node_modules
	#
	# npv babel
	# > 5.8.35
	#
	packageName=$1
	if [ ! "$packageName" ]; then
		>&2 echo "Please pass packageVersion as first argument"
		exit
	fi
	packageVersion=`cat "./node_modules/$packageName/package.json" 2>/dev/null | grep '"version"' | sed 's/version//' | sed 's/[[:space:]]//g' | sed 's/"//g' | sed 's/://g' | sed 's/,//g'`
	if [ ! "$packageVersion" ]; then
		>&2 echo "Can't find package version of $packageName"
		>&2 echo "Try npm list | grep '$packageName'"
		exit
	fi
	# @todo: option to strip newline from echo: (useful sometimes in scripts)
	#echo $packageVersion | tr -d '\n'
	echo $packageVersion
)

atest(){
	check=
	if [ "`grep -E "(^|\s)-e(\s|$)" <<< "$@"`" ]; then
		echo "1"
	else
		echo "2"
	fi
}

if [ -f /tmp/start.sh ]; then
	./tmp/start.sh
fi

# zat (app maker for zendesk) doesnt like echoes in .profile
#echo "yay profile"



