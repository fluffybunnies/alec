
$env:Path += ';C:\Program Files\PostgreSQL\16\bin'
$env:Path += ';C:\Program Files\ngrok'
$env:Path += ';C:\Program Files\MySQL\MySQL Workbench 8.0 CE'
#$env:Path += ';C:\Program Files\MySQL\MySQL Server 9.0\bin'
#$env:Path += ';C:\Program Files\MySQL\MySQL Server 9.1\bin'
$env:Path += ";$HOME\.datalot\bin"
$env:Path = "$HOME\AppData\Local\Programs\Python\Python313;" + $env:Path
$env:Path += ";$HOME\AppData\Local\Programs\Python\Python313\Scripts"
$env:Path += ';C:\Program Files\grpcurl_1.9.3_windows_x86_64'
$env:Path += ';C:\Users\ahulce\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-7.1.1-full_build\bin'


Set-PSReadLineKeyHandler -Key Ctrl+u -Function BackwardDeleteLine
#Set-PSReadLineKeyHandler -Key Ctrl+k -Function ClearScreen
Set-PSReadlineKeyHandler -Key Tab -Function MenuComplete


Set-PSReadLineKeyHandler -Key Ctrl+k -ScriptBlock {
  [Microsoft.PowerShell.PSConsoleReadLine]::RevertLine()
  [System.Console]::Clear()  # Clears the screen
  [System.Console]::SetCursorPosition(0,0)  # Moves cursor to top-left

  # Instead of InvokePrompt(), manually call the prompt function
  $promptText = (Invoke-Expression (Get-Command prompt).Definition)
  [System.Console]::Write($promptText)
}


if (!$_profileInited) {
  $_profileInited=1
  cd ~/Documents
}

$Global:GrepV_ArgsFile = "$env:TEMP\grepv_last_args"
function gropen {
    if (-not (Test-Path $Global:GrepV_ArgsFile)) {
        Write-Host "No previous grepv invocation found."
        return
    }

    $args = Get-Content $Global:GrepV_ArgsFile
    if ($args.Count -eq 0) {
        Write-Host "Stored grepv arguments are empty."
        return
    }

    # Call grepv with saved args and capture its output
    $results = & grepv @args

    # Extract unique file paths from the grepv output
    $filePaths = $results |
        Where-Object { $_ -match "^(.*?):" } |
        ForEach-Object { $matches[1] } |
        Sort-Object -Unique

    foreach ($file in $filePaths) {
        topen $file
    }
}

function grepv() {
  # Save args for future reuse in `gropen`
  Set-Content -Path $Global:GrepV_ArgsFile -Value ($args -join "`n") -Encoding utf8
  # Run grepv
  grep -R @args | grep -v Binary | grep -v bin/ | grep -v obj/ | grep -v package.lock | grep -v venv/
}

function topen {
    param (
        [string]$filePath
    )
    if (-not $filePath) {
        throw "Please specify a file path"
    }
    $fileDir = Split-Path $filePath
    if (-not $fileDir) {
        $fileDir = "."  # current directory
    }
    if (-not (Test-Path $fileDir)) {
        New-Item -ItemType Directory -Path $fileDir -Force | Out-Null
    }
    if (-not (Test-Path $filePath)) {
        New-Item -ItemType File -Path $filePath -Force | Out-Null
    }
    code $filePath
}

function copen {
    param (
        [string]$filePath
    )
    if (-not $filePath) {
        throw "Please specify a file path"
    }
    $fileDir = Split-Path $filePath
    if (-not $fileDir) {
        $fileDir = "."  # current directory
    }
    if (-not (Test-Path $fileDir)) {
        New-Item -ItemType Directory -Path $fileDir -Force | Out-Null
    }
    if (-not (Test-Path $filePath)) {
        New-Item -ItemType File -Path $filePath -Force | Out-Null
    }
    cursor $filePath
}

function open {
  explorer $(Resolve-Path "$($args[0])")
}

function wopen {
  start chrome $(Resolve-Path "$($args[0])")
}

function rimraf {
  # Same as shorthand: rm -r -Force
  param(
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$Paths
  )

  foreach ($Path in $Paths) {
    Remove-Item -Path $Path -Recurse -Force -ErrorAction SilentlyContinue
  }
}
function rmfr {
  rimraf @args
}
function rmrf {
  rimraf @args
}

function findot() {
  gci -r $args[0] | Select-Object -ExpandProperty FullName
}

function rprofile() {
  . $PROFILE
}

function saveprofile() {
  $targetDir="C:\Dropbox\alec_repo\"
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

  # Find the git root directory
  $gitRoot = git rev-parse --show-toplevel
  if (!$gitRoot) {
    Write-Error "Not inside a git repository."
    return
  }

  Push-Location $gitRoot
  git add --all .
  Pop-Location

  git commit -a -m "$msg"
  git pull origin $currentBranch # exit on error to prevent pushing merge conflicts
  git push origin $currentBranch
}


function bitch {
    param(
        [Parameter(ValueFromRemainingArguments=$true)]
        [string[]]$args
    )

    if ($args[0] -eq "please") {
        $lastCommand = (Get-History -Count 1).CommandLine
        if ($lastCommand) {
            Invoke-Expression "sudo $lastCommand"
        }
    } else {
        sudo @args
    }
}


function nut {
  node --no-deprecation C:/Dropbox/centerfield/nut
}


