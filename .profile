
# elastic beanstalk
export PATH=$PATH:/Users/ahulce/AWS-ElasticBeanstalk-CLI-2.6.3/eb/macosx/python2.7

# MacPorts Installer addition on 2012-02-29_at_15:43:38: adding an appropriate PATH variable for use with MacPorts.
export PATH=/opt/local/bin:/opt/local/sbin:/usr/local/share/npm/bin:$PATH
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
	$1
}

poo(){
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
	git fetch
	git checkout prod
	git pull origin prod
	git merge master
	git push origin prod
	git checkout master
}

mastit(){
	currentBranch=`git branch | grep '*' | head -n1 | sed -n 's/^\* //p'`
	echo "current branch: $currentBranch"
	echocute 'git checkout master'
	echocute 'git fetch'
	echocute 'git pull origin master'
	echocute "git checkout $currentBranch"
	echocute 'git merge master'
	echocute "git push origin $currentBranch"
}

bitch() {
	if [[ $1 -eq "please" ]]; then
		eval "sudo $(fc -ln -1)"
	else
		sudo "$@"
	fi
}

gropen2() {
	# old way, waits till the end
	_IFS=$IFS
	IFS=$'\n'
	g=`grep -l "$@"`
	for file in $g; do
		open $file
	done
	IFS=$_IFS
}

gropen() {
	app='/Applications/Sublime Text 2.app'
	grep -l --line-buffered "$@" | xargs -n1 open -a"$app"
}

fsh() {
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

# zat (app maker for zendesk) doesnt like echoes in .profile
#echo "yay profile"


