# bash
<!--
	@todo: explain these are in unix-type syntax
	@todo: consider format where title explains generic action and below it are more specific questions that you could use the solution to solve
		like: Title: Run a command after sshing in one line, Subtitle: How to change current working directory immediately after SSHing into a remote machine?
	@todo: consider googling the questions to find better titles, or terms people are looking for
-->



## echo to stderr
```
>&2 echo 'err!'
```



## Proper error redirection
See ./bash_redir_proof/
```
# correct
./throws.sh > ./good.log~ 2>&1
# incorrect
./throws.sh 2>&1 > ./bad.log~
```
<!-- Tags: bash, file redirection? -->



## Write to both stdout and a file
```
echo "sup" 2>&1 | tee pathtofile
```



## tar and compress

#### Single file
```
tar zcf test.sql.tar.Z test.sql
```

#### Directory
@todo
```
```

#### Very large directory
We `cd` in order for `find` to output relative paths
```
tardir()(
	# Tar+Zip large directory
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
		untardirc "$2" "$3"
		exit
	fi
	if [ ! "$target" ]; then target=`pwd`/`basename "$source"`.tar.gz; # tardirc /tmp
	elif [ -d "$target" ]; then target=`cd "$target";pwd`/`basename "$source"`.tar.gz; # tardirc /tmp ../
	fi

	curdir=`pwd`
	cd "$source"
	includeFile=`mktemp -t tartmp.XXXXXX`
	find . -type f > "$includeFile"

	tar -T "$includeFile" -zcf "$target"

	rm "$includeFile"
	cd "$curdir"
)
```

#### Untar + unzip archive
```
untardir()(
	# Untar+unzip archive
	# tardirc path/to/archive.tar.gz path/to/target/dir
	#
	# Omit second argument to target cwd
	# untardir path/to/archive.tar.gz
	#
	source=$1
	target=$2
	if [ ! "$target" ]; then target=./; fi

	tar -zxf "$source" -C "$target"
)
```



## Multiline Comments
```
if [ 0 ]; then
: <<'multiline_comment'
i gots
lots
to say
multiline_comment
fi
```
Simplified:
```
: <<'ÿ'
its fairly safe that commands in my multiline comment like
echo "ls /tmp" && ls /tmp
wont run. the `if [ 0 ]` bit is just a safeguard against human error / collisions
ÿ
```



## Empty a File and Open For Editing in One Command
Useful if working on a file locally and testing on remote server via ssh shell<br />
I can copy the entire contents from my local text editor, and paste it into my shell to overwrite the remote file
<!-- @todo: follow this up with `shep` -->
<!-- "See `shep` below for an even easier method to accomplish the same task" -->
```
: > path/to/file && vim path/to/file
```
`: > path/to/file` truncates the file<br />
`vim path/to/file` opens it up for editing<br />
You can change `vim` to whatever editor suits your preference



## Echo Single Line With No Trailing Newline Character
```
# Remove all newlines:
tr -d '\n'
# Example:
cat /tmp/myfile | head -n1 | tr -d '\n'
```
<!-- @todo: use the word "strip" -->
<!-- @todo: useful-for example, e.g. piping to sed, e.g. see what problems will or rob had when building the auto-git-prepend-ticket-number script -->



## Extract Specific Line Number from Input
@todo
```
# cat /my/file | awk [line 2]
```



## Run Piped Input
@todo
```
# php bin/mysql.php | awk [line 2] | exec
```



## Make vim (basic) your default text editor
Tired of crontab -e opening up in Tiny?
```
# unix:
update-alternatives --config editor
export VISUAL=vim
# mac:
export EDITOR=nano
```



## Run process in background
<!-- @todo: explain nohup vs disown vs &
		http://unix.stackexchange.com/questions/3886/difference-between-nohup-disown-and
-->
If already running:
```
[run commands]
ctrl + z
bg
# if want to exit a parent process like a tty, continue with disown + exit:
disown
exit
```
If not:
```
screen
# [press ENTER / SPACE]
# [run commands]
ctrl + a + d # to exit while leaving commands running in background
```
Or:
```
nohup ([run commands])
```



## OptArgs
Prepend letter with a colon (":") to expect argument value as `$OPTARG`
```
while getopts 'm:qs' opt; do
	case $opt in
		m)
			arg1=true
		;;
		q)
			arg2=$OPTARG
		;;
		m)
			arg3=1
		;;
	esac
done
```
<!-- @todo: better description + keywords, also explain you can reference $1, $2, etc. explain what $0 is here -->



## Switch user to root immediately after SSHing, in one line
```
ssh -t ubuntu@187.65.43.21 'sudo -i'
```



## Navigate to a directory immediately after SSHing, in one line
```
ssh -t ubuntu@187.65.43.21 'cd /path/to/default/dir; /bin/bash'
```
You can create a function to attempt several directories so it will work when connecting to various frequently-visited environments:
```
shudo()(
	# I webadmin WalMart, a php plaform, and a site that houses my resume
	# I'd like to be able to `shudo my_server` and instantly arrive in my website's root directory
	# Usage: shudo 187.65.43.21
	remoteServer=$1
	ssh -t ubuntu@$remoteServer 'cd /var/www && cd walmart-web 2>/dev/null || cd resume_site 2>/dev/null || cd platform-v2 2>/dev/null; /bin/bash'
)
```
The above will place you in `/var/www` regardless, and proceed to `/var/www/walmart-web` or `/var/www/resume_site` etc if the directory exists.



## Switch user to root AND change directory immediately after SSHing
```
ssh -t ubuntu@187.65.43.21 "sudo -i su -c 'cd /var/www && cd walmart-web 2>/dev/null || cd resume_site 2>/dev/null || cd platform-v2 2>/dev/null; /bin/bash'"
```
Let's make a function using the above concept that we could add to our `~/.profile` or `~/.bashrc`:
```
shudo()(
	# Usage: shudo 187.65.43.21
	remoteServer=$1
	s='2>/dev/null'
	c="cd /var/www && cd walmart-web $s || cd resume_site $s || cd platform-v2 $s"
	t="sudo -i su -c '$c; /bin/bash'"
	ssh -t ubuntu@$remoteServer $t
)
```
Unfortunately, newer versions of ubuntu no longer allow interactive shells to be initialized via scripts for security reasons. Which means if you ever hit `ctrl+c`, your SSH shell will terminate and your remote connection will be lost.<br />
To avoid this, we can use a combination of a simplified `shudo` function with an addition to our remote instance's `~/.bashrc`:
```
# add this to your local ~/.profile or ~/.bashrc:
shudo()(
	# Usage: shudo 187.65.43.21
	ssh -t ubuntu@$1 'sudo -i'
)
# then add this snippet to the remote instance's ~/.bashrc (potentially via deployment script [e.g. chef])
cd /var/www && cd walmart-web 2>/dev/null || cd resume_site 2>/dev/null || cd platform-v2 2>/dev/null
```
Now you can `shudo 187.65.43.21` and be instantly logged in as root _and_ be placed in your web root directory _without_ the inconvenience of getting logged out if you press `ctrl+c` after, for example, `tail -f`ing or `top`ing



## Run any command immediately after SSHing, in one line
@todo
```
```
<!-- @todo: Maybe more specific title, with subtitle like: "Same as: ssh ubuntu@instance, sudo -i, cd to web directory" -->
<!-- @todo: Language that follows up on previous snips. Maybe simply copy the best previus shudo() and include "any command" as argument -->



## Get directory of script being run
@todo
```
# change to script's directory right away
cd `dirname "$0"`
# @todo: return realpath to script's dir to var
```
<!-- @todo: better title -->
<!-- @todo: subtitle like "ensure your script's current working directory" or "" -->
<!-- @todo: explain this does not work with sourced files, e.g. `. path/to/script` -->
<!-- @todo: try to break it with spaces -->



## Delete files older than a certain amount of time
```
# delete 
find ./path/to/dir/ -mtime +7 -type f -print0 | xargs -0 rm -v
```
<!-- @todo: explain why "-print0" in find and "-0" in xargs - separates results with NUL so files with spaces dont screw things up -->
<!-- @todo: explain that "+7" defaults to days, but check your `man find` docs for other time formats -->



## Pipe stuff without invoking echo command
For example: If you want to pipe/pass "-e" as a string and don't want `echo` to interpret it as an argument
```
echo "-e" | sed 's/-e/sup/'
# vs
sed 's/-e/sup/' <<< "-e"
```
<!-- @todo: would be awesome to have a function like doesArgExistAndRemoveFromListIfItDoes() or removeArgIfExists() -->



## Updating Python on Max OSX
Example below uses version 3.4.4<br /><br />
1. Check current version

```
which python && python --version || >&2 echo 'cant find python path'
```
2. Download desired version: http://python.org/download
3. Install package via double-clicking on downloaded .pkg
4. Move downloaded version to python directory

	```
	sudo mv /Library/Frameworks/Python.framework/Versions/3.4 /System/Library/Frameworks/Python.framework/Versions
	```
5. Point current at new version

	```
	# navigate to python directory
	cd /System/Library/Frameworks/Python.framework/Versions
	# inspect existing symlink in case need to revert
	ls -l ./Current
	# create the symlink
	sudo ln -sfh 3.4 ./Current
	```
6. Set user group/permissions

	```
	sudo chown -R root:wheel ./3.4
	```
7. Symlink /usr/bin (if haven't already)

	```
	# back up files just in case
	mkdir /tmp/python-upgrade-baks
	sudo cp /usr/bin/pydoc /tmp/python-upgrade-baks/
	sudo cp /usr/bin/python /tmp/python-upgrade-baks/
	sudo cp /usr/bin/pythonw /tmp/python-upgrade-baks/
	sudo cp /usr/bin/python-config /tmp/python-upgrade-baks/
	sudo ln -sfh /System/Library/Frameworks/Python.framework/Versions/3.4/bin/pydoc3 /usr/bin/pydoc
	sudo ln -sfh /System/Library/Frameworks/Python.framework/Versions/3.4/bin/python3 /usr/bin/python
	#sudo ln -sfh /System/Library/Frameworks/Python.framework/Versions/3.4/bin/pythonw3 /usr/bin/pythonw
	# ^^ pythonw not a thing in 3.4, if accidentally symlinked, run this to revert:
	# sudo ln -sfh /System/Library/Frameworks/Python.framework/Versions/2.7/bin/pythonw /usr/bin/pythonw
	sudo ln -sfh /System/Library/Frameworks/Python.framework/Versions/3.4/bin/python3-config /usr/bin/python-config
	# these probably arent necessary, but to match existing pattern just in case edge-case references:
	sudo ln -s /System/Library/Frameworks/Python.framework/Versions/3.4/bin/pydoc3.4 /usr/bin/pydoc3.4
	sudo ln -s /System/Library/Frameworks/Python.framework/Versions/3.4/bin/python3.4 /usr/bin/python3.4
	sudo ln -s /System/Library/Frameworks/Python.framework/Versions/3.4/bin/python3.4-config /usr/bin/python3.4-config
	#sudo ln -s /System/Library/Frameworks/Python.framework/Versions/3.4/bin/pythonw3.4 /usr/bin/pythonw3.4
	# ^^ pythonw not a thing in 3.4, if accidentally symlinked, run this to revert:
	# sudo rm -f /usr/bin/pythonw3.4
	```
8. Clean things up

	```
	rm -v ~/Downloads/python-3.4.4-macosx10.6.pkg
	# optional: delete older versions
	sudo rm -frv ./2.*
	```
9. Update your IDE to point at new installation if you use one



### Monitor progress of pipe
Pipeviewer
```
# install pipe viewer
[apt-get/yum/sudo port] install pv

# use pv instead of cat
pv /tmp/backup.sql > /dev/null

# monitor tar progress
tar -czf - . | pv > out.tgz

# etc
```



### Watch File / Directory for Changes
```bash
# Ex: Run a server restart script when any nodejs-type file in application changes
inotifywait -r -m \
--exclude "node_modules|.git" \
-e create,modify,moved_to,moved_from,delete \
"$appRoot" |
while read -r line; do
	if [ "`echo \"$line\" | grep '.js\|.jsx\|.json\|.hbs\|.jade'`" ]; then
		"$appRoot/dev_restart.sh"
		sleep 1 # forever's spinSleepTime defaults to 1000ms, need to be up for at least that long for forever to care
		break # we only need to restart once
	fi
done
```


