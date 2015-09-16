# MySql


### Monitor progress of import from mysqldump
```
# install pipe viewer
apt-get install pv

# use pv instead of cat
pv /tmp/backup.sql | mysql -uUser -p'Pass' Db
```

