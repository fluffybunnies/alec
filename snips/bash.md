# bash


## echo to stderr
```
>&2 echo 'err!'
```

## Correct error redirection
See ./bash_redir_proof/

```
# correct
./throws.sh > ./good.log~ 2>&1
# incorrect
./throws.sh 2>&1 > ./bad.log~
```


## tar

### tar single file
```
tar zcf test.sql.Z test.sql
```

### tar directory
```
```

### tar very large directory
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

### untar+unzip archive
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
You don't really need the `if [ 0 ]` bit...
```
: <<'ÿ'
echo "ls /tmp"
ls /tmp
ÿ
```


## Clear and Edit File
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


