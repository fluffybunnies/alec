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
# or
git rebase -i HEAD~2 # where 2 means we are looking at the last 2 commits
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


## Delete all unmerged local branches except master
git branch names are not allowed whitespace, so xargs is sufficient
```
# make sure you are on master - you won't be able to delete the branch you have checked out
git checkout master
# delete em all!
git branch | xargs git branch -d

# use uppercase delete arg if you want to wipe unmerged branches
git branch | xargs git branch -D
```


## git diff excluding specific directory
<!-- git diff except directory, git diff ignore directory -->
<!-- @todo: explain syntax like using | for multiple dirs etc -->
```
git diff -- . ':!node_modules'
```


## Avoid auth check on `git pull`
If `git pull` requires a commit to merge incoming changes, it can error out with "*** Please tell me who you are. ... fatal: unable to auto-detect email address"
<br />Instead, delete the target branch and check it out again
```
# Instead of...
git fetch
git checkout -f $targetBranch
git pull origin $targetBranch

# Do this...
git fetch
git checkout -f -b _temp_
git checkout -f _temp_
git branch -D $targetBranch
git checkout -f $targetBranch
git branch -D _temp_
```


# State info
```
# current tag
git describe --tags
# current commit hash
git rev-parse HEAD
# current branch
git rev-parse --abbrev-ref HEAD
# commit history
git log --pretty=%s | head -n4
```



## Disable push to master
@todo
<!-- http://stackoverflow.com/questions/10260311/git-how-to-disable-push -->


## Disable push to repo
@todo
<!-- http://stackoverflow.com/questions/10260311/git-how-to-disable-push -->




