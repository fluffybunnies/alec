# Mac OSX



### Enable/Disable Spotlight Indexing
I have 16GB of RAM and this can still slow my OS down to a crawl
```
# Disable
sudo launchctl unload -w /System/Library/LaunchDaemons/com.apple.metadata.mds.plist
# Enable
sudo launchctl load -w /System/Library/LaunchDaemons/com.apple.metadata.mds.plist
```



### List of places
<!-- @todo: theres a link i always use in chrome fav places -->
@todo



