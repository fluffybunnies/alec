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

### Single file
```
tar zcf test.sql.tar.Z test.sql
```

### Directory
@todo
```
```

### Very large directory
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

### Untar + unzip archive
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



## Empty and Edit File in One Command
Useful if working on a file locally and testing on remote server via ssh shell
```
: > path/to/file && vim path/to/file
```



## Echo Single Line (no trailing newline)
```
# Remove all newlines:
tr -d '\n'
# Example:
cat /tmp/myfile | head -n1 | tr -d '\n'
```



## Extract Specific Line Number from Input
@todo
```
# cat /my/file | awk [line 2]
```



## Run Output
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
If already running:
```
[run commands]
ctrl + z
bg
```
If not:
```
screen
ENTER / SPACE
[run commands]
ctrl + a + d
```
Or:
```
nohup ([run commands])
```



## OptArgs
<!-- @todo: better description + keywords, also explain you can reference $1, $2, etc. explain what $0 is here -->
```
while getopts 'm:q' opt; do
	case $opt in
		m)
			arg1=1
		;;
		q)
			arg2=$OPTARG
		;;
	esac
done
```



## Run a command immediately after sshing in one line
@todo
<!-- Maybe more specific title, with subtitle like: "Same as: ssh ubuntu@instance, sudo -i, cd to web directory" -->
```
```



## Change user to root immediately after sshing in one line
@todo
<!-- Explain: "su -c no longer allows interactive shells, which is annoying when ctrl+c destroys your connection. instead, push your cd command to /root/.bashrc" -->
```
```



## Get directory of script being run
@todo
<!-- @todo: better title -->
<!-- @todo: subtitle like "ensure your script's current working directory" or "" -->
<!-- @todo: explain this does not work with sourced files, e.g. `. path/to/script` -->
<!-- @todo: try to break it with spaces -->
```
# change to script's directory right away
cd `dirname "$0"`
# @todo: return realpath to script's dir to var
```



## Delete files older than a certain amount of time
<!-- @todo: explain why "-print0" in find and "-0" in xargs - separates results with NUL so files with spaces dont screw things up -->
<!-- @todo: explain that "+7" defaults to days, but check your `man find` docs for other time formats -->
```
# delete 
find ./path/to/dir/ -mtime +7 -type f -print0 | xargs -0 rm -v
```



## Pipe stuff without invoking echo command
For example: If you want to pipe/pass "-e" as a string and don't want `echo` to interpret it as an argument
```
echo "-e" | sed 's/-e/sup/'
# vs
sed 's/-e/sup/' <<< "-e"
```
<!-- @todo: would be awesome to have a function like doesArgExistAndRemoveFromListIfItDoes() or removeArgIfExists() -->



## Updating Python on Max OSX
<div style="opacity:0.8;">Example below uses version 3.4.4</div>
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




