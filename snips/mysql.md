# MySql


### Monitor progress of import from mysqldump
```
# install pipe viewer
apt-get install pv

# use pv instead of cat
pv /tmp/backup.sql | mysql -uUser -p'Pass' Db
```


### Export Table with Column Names to CSV without using INTO OUTFILE
```
mysql -h$(docker-machine ip) -uuk_api -p333tkd333 --column-names=TRUE urbankitchens -e \
"PASTE_QUERY_HERE" \
> ~/Downloads/query.csv
```

