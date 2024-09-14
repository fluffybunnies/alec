
$env:Path += ';C:\Program Files\PostgreSQL\16\bin'
$env:Path += ';C:\Program Files\ngrok'


Set-PSReadLineKeyHandler -Key Ctrl+u -Function BackwardDeleteLine
#Set-PSReadLineKeyHandler -Key Ctrl+k -Function ClearScreen
Set-PSReadlineKeyHandler -Key Tab -Function MenuComplete

Set-PSReadLineKeyHandler -Key Ctrl+k -ScriptBlock {
    [Microsoft.PowerShell.PSConsoleReadLine]::RevertLine()
    [Microsoft.PowerShell.PSConsoleReadLine]::Insert('cls')
    [Microsoft.PowerShell.PSConsoleReadLine]::AcceptLine()
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
  explorer $args[0]
}

function rimraf {
  # Same as shorthand: rm -r -Force
  Remove-Item $args[0] -Recurse -Force
}
function rmfr {
  # Same as shorthand: rm -r -Force
  Remove-Item $args[0] -Recurse -Force
}

function findot() {
  gci -r $args[0] | Select-Object -ExpandProperty FullName
}

function rprofile() {
  . $profile
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


