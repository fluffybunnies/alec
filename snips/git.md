# git


## Edit most recent commit message
```
git commit --amend
# if already pushed
git push origin +BRANCH
```


## Edit second to last commit
```
git rebase -i HEAD^^
# change "pick" to "edit" for commits of which you wish to edit
git commit --amend
git rebase --continue
# repeat for each commit you marked with "edit"
git push origin +BRANCH
```


## Merge multiple commits together
Warning: Should only do this prior to pull request merge<br />
Can get hairy if this is done to a shared branch (e.g. master)
```
git rebase -i master
# change "pick" to "s" (or "squash") for all but the top commit
git push origin +BRANCH
```
Note: "master" can be replaced with any commit in your history


## Delete a tag
Warning: Do not do this
```
# delete local tag
git tag -d TAG
# delete remote tag
git push origin :refs/tags/TAG
```


## Delete a branch
```
# delete local branch
git branch -D BRANCH
# delete remote branch
git push origin :branch
```


