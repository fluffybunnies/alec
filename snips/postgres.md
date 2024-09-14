


# Create user + grant access
```psql
create user USER with password 'PASS';
grant all privileges on database DATABASE to USER;
grant all privileges on schema public to USER;
```


# Delete user
```psql
revoke all privileges on database DATABASE from USER;
revoke all on schema public from USER;
drop user USER;
```

