# MySql


### Monitor progress of import from mysqldump
```
# install pipe viewer
apt-get install pv

# use pv instead of cat
pv /tmp/backup.sql | mysql -uUser -p'Pass' Db
```


### Export Table with Column Names to CSV
...and open with Excel for formatted copy+paste (e.g. to Google Spreadsheet)
```
# mktemp not used as mysql user is more likely to have access to /tmp
tmp=/tmp/sql.$(date +'%s').csv && echo "use fsb; select 'ID', 'Name', 'Rating' union all select id,display_name,ifnull(rating,'') from companies into outfile '$tmp' fields terminated by ',' enclosed by '\"' lines terminated by '\n'" | mysqlc && open -a/Applications/Microsoft\ Office\ 2011/Microsoft\ Excel.app "$tmp";
```

