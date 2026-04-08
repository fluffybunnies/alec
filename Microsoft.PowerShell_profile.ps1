
$env:Path += ';C:\Program Files\PostgreSQL\17\bin'
$env:Path += ';C:\Program Files\ngrok'
$env:Path += ';C:\Program Files\MySQL\MySQL Workbench 8.0 CE'
#$env:Path += ';C:\Program Files\MySQL\MySQL Server 9.0\bin'
#$env:Path += ';C:\Program Files\MySQL\MySQL Server 9.1\bin'
$env:Path += ";$HOME\.datalot\bin"
$env:Path = "$HOME\AppData\Local\Programs\Python\Python313;" + $env:Path
$env:Path += ";$HOME\AppData\Local\Programs\Python\Python313\Scripts"
$env:Path += ';C:\Program Files\grpcurl_1.9.3_windows_x86_64'
$env:Path += ';C:\Users\ahulce\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-7.1.1-full_build\bin'
$env:Path += ';C:\Users\ahulce\AppData\Local\pnpm'
$env:Path += ';C:\Users\ahulce\.local\bin'
$env:Path += ';C:\Program Files\rclone-v1.73.2-windows-amd64'


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
  
  # Save PowerShell profile
  cp $profile $targetDir
  $filename=(Split-Path $profile -leaf)
  echo "Saved profile to: $targetDir$filename"
  echo "Modified time: $((Get-Item $targetDir$filename).LastWriteTime)"
  
  # Save Cursor skills
  #$skillsSource = "$HOME\.cursor\skills-cursor"
  #$skillsTarget = "C:\Dropbox\alec_repo\cursor-skills"
  #if (Test-Path $skillsSource) {
  #  if (-not (Test-Path $skillsTarget)) {
  #    New-Item -ItemType Directory -Path $skillsTarget -Force | Out-Null
  #  }
  #  Copy-Item -Path "$skillsSource\*" -Destination $skillsTarget -Recurse -Force
  #  echo "Saved Cursor skills to: $skillsTarget"
  #}
  
  # Save Cursor rules (if any exist)
  #$rulesSource = "$HOME\.cursor\rules"
  #$rulesTarget = "C:\Dropbox\alec_repo\cursor-rules"
  #if (Test-Path $rulesSource) {
  #  if (-not (Test-Path $rulesTarget)) {
  #    New-Item -ItemType Directory -Path $rulesTarget -Force | Out-Null
  #  }
  #  Copy-Item -Path "$rulesSource\*" -Destination $rulesTarget -Recurse -Force
  #  echo "Saved Cursor rules to: $rulesTarget"
  #}
}

function mastif {
  $branch=$args[0]
  if (!$branch) {
    $branch="master"
  }
  git fetch && git checkout -f $branch && git pull origin $branch && git fetch --tags
}

function gdel {
    param(
        [string]$targetBranch = "master",
        [switch]$DryRun
    )
    
    Write-Host "Fetching remote branches..." -ForegroundColor Cyan
    git fetch --prune
    
    # Checkout target branch
    $e = $(git checkout $targetBranch 2>&1 | Select-Object -Last 1)
    if ($e -notmatch "Already on '$targetBranch'" -and $e -notmatch "Switched to branch '$targetBranch'") {
        Write-Host $e -ForegroundColor Red
        return
    }
    
    # Update target branch
    Write-Host "Updating $targetBranch..." -ForegroundColor Cyan
    git pull origin $targetBranch
    
    Write-Host "`nAnalyzing branches..." -ForegroundColor Cyan
    
    # Get all local branches except the target branch
    $branches = git branch | Where-Object { !$_.Contains('*') } | ForEach-Object { $_.Trim() }
    
    # Get all remote branches (strip 'origin/' prefix)
    $remoteBranches = git branch -r | ForEach-Object { 
        $b = $_.Trim()
        if ($b -match '^origin/(.+)$') {
            $matches[1]
        }
    } | Where-Object { $_ -ne 'HEAD' }
    
    $toDelete = @()
    $kept = @()
    
    foreach ($branch in $branches) {
        # Skip if empty or is the target branch
        if ([string]::IsNullOrWhiteSpace($branch) -or $branch -eq $targetBranch) { continue }
        
        # Check if branch has a remote tracking branch that still exists
        $upstreamBranch = git rev-parse --abbrev-ref "$branch@{upstream}" 2>$null
        if ($LASTEXITCODE -eq 0 -and $upstreamBranch) {
            # Upstream exists, keep it
            $kept += "$branch (tracking: $upstreamBranch)"
            continue
        }
        
        # Check if this local branch name matches a remote branch name
        if ($remoteBranches -contains $branch) {
            # Remote branch with same name exists, keep it
            $kept += "$branch (name match)"
            continue
        }
        
        # No valid upstream and no remote name match, mark for deletion
        $toDelete += $branch
    }
    
    # Display results
    Write-Host "`nBranches to delete (no remote branch) ($($toDelete.Count)):" -ForegroundColor Yellow
    $toDelete | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
    
    if ($kept.Count -gt 0) {
        Write-Host "`nBranches kept (remote exists) ($($kept.Count)):" -ForegroundColor Green
        $kept | ForEach-Object { Write-Host "  - $_" -ForegroundColor Green }
    }
    
    # Delete branches
    if ($DryRun) {
        Write-Host "`n[DRY RUN] No branches were deleted." -ForegroundColor Magenta
    } elseif ($toDelete.Count -gt 0) {
        Write-Host "`nDeleting branches..." -ForegroundColor Cyan
        foreach ($branch in $toDelete) {
            git branch -D $branch
        }
        Write-Host "`nCurrent branches:" -ForegroundColor Cyan
        git branch
    } else {
        Write-Host "`nNo branches to delete." -ForegroundColor Green
    }
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






function claude {
    Write-Host ""
    Write-Host "  YOU ARE ON WINDOWS! ARE YOU ABSOLUTELY SURE YOU WANT TO OPEN CLAUDE?" -ForegroundColor Red
    Write-Host "  (You probably meant to 'wsl' first.)" -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "  Type YES to continue, anything else to abort"
    if ($response -eq "YES") {
        & claude.exe @args
    } else {
        Write-Host "  Aborted." -ForegroundColor Cyan
    }
}

function nut { param([string]$args) $nutDir='C:/Dropbox/alec_repo/nut'; if (-not(Test-Path "$nutDir/node_modules")) { npm install --prefix $nutDir }; node --no-deprecation $nutDir $args }

