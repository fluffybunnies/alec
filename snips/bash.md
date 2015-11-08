# bash


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



## tar and compress

### Single file
```
tar zcf test.sql.Z test.sql
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
update-alternatives --config editor
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


