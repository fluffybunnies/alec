
$env:Path += ';C:\Program Files\PostgreSQL\16\bin'
$env:Path += ';C:\Program Files\ngrok'
$env:Path += ';C:\Program Files\MySQL\MySQL Server 9.0\bin'

Set-PSReadLineKeyHandler -Key Ctrl+u -Function BackwardDeleteLine
#Set-PSReadLineKeyHandler -Key Ctrl+k -Function ClearScreen
Set-PSReadlineKeyHandler -Key Tab -Function MenuComplete

Set-PSReadLineKeyHandler -Key Ctrl+k -ScriptBlock {
  [Microsoft.PowerShell.PSConsoleReadLine]::RevertLine()
  [Microsoft.PowerShell.PSConsoleReadLine]::Insert('cls')
  [Microsoft.PowerShell.PSConsoleReadLine]::AcceptLine()
}

if (!$_profileInited) {
  $_profileInited=1
  cd ~/Documents
}

function topen {
  if (!$args[0]) {
    throw "please specify a file path"
  }
  $filePath=$args[0]
  $fileDir=$(dirname $filePath)
  if (!(Test-Path $fileDir)) {
    mkdir -p $fileDir
  }
  if (!(Test-Path $filePath)) {
    touch $filePath
  }
  code $filePath
}

function open {
  explorer $(Resolve-Path "$($args[0])")
}

function wopen {
  start chrome $(Resolve-Path "$($args[0])")
}

function rimraf {
  # Same as shorthand: rm -r -Force
  Remove-Item $args[0] -Recurse -Force
}
function rmfr {
  rimraf $args
}
function rmrf {
  rimraf $args
}

function findot() {
  gci -r $args[0] | Select-Object -ExpandProperty FullName
}

function rprofile() {
  . $profile
}

function saveprofile() {
  $targetDir="$HOME\Dropbox\alec_repo\"
  cp $profile $targetDir
  $filename=(Split-Path $profile -leaf)
  echo "Saved to: $targetDir$filename"
  echo "Modified time: $((Get-Item $targetDir$filename).LastWriteTime)"
}

function mastif {
  $branch=$args[0]
  if (!$branch) {
    $branch="master"
  }
  git fetch && git checkout -f $branch && git pull origin $branch && git fetch --tags
}

function gdel {
  $e=$(git checkout master 2>&1 | tail -n1)
  if ($e -ne "Already on 'master'" -and $e -ne "Switched to branch 'master'") {
    echo $e
    return
  }

  git branch
  git branch | ForEach-Object {
    if (!$_.Contains('*')) {
      git branch -d $_.Trim()
    }
  }
  git branch
}

function poo {
  $currentBranch=$(git branch | Select-String -Pattern "\*" | sed -n 's/^\* //p')
  $msg="$args"
  if (!$msg) {
    $msg="stash"
  }
  git add --all .
  git commit -a -m "$msg"
  git pull origin $currentBranch # exit on error to prevent pushing merge conflicts
  git push origin $currentBranch
}

