
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
    param(
        [string]$targetBranch = "master",
        [switch]$DryRun
    )
    
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
    
    # Get all local branches except the current one
    $branches = git branch | Where-Object { !$_.Contains('*') } | ForEach-Object { $_.Trim() }
    
    $toDelete = @()
    $protected = @()
    
    foreach ($branch in $branches) {
        # Skip if empty
        if ([string]::IsNullOrWhiteSpace($branch)) { continue }
        
        # Check if traditionally merged (fast path)
        $mergedBranches = git branch --merged $targetBranch | ForEach-Object { $_.Trim().TrimStart('* ') }
        if ($mergedBranches -contains $branch) {
            $toDelete += $branch
            continue
        }
        
        # Check if branch has identical content to target (handles squash merges)
        # Compare tree hashes for exact content match, regardless of commit history
        $branchTree = git rev-parse "$branch^{tree}" 2>$null
        $targetTree = git rev-parse "$targetBranch^{tree}" 2>$null
        if ($branchTree -eq $targetTree) {
            # Identical content means the branch's changes have been incorporated
            $toDelete += $branch
            continue
        }
        
        # Check if branch is an ancestor of target (handles old branches where target moved ahead)
        # This catches branches that were merged and then master moved forward
        git merge-base --is-ancestor $branch $targetBranch 2>$null
        if ($LASTEXITCODE -eq 0) {
            # Branch is fully contained in target's history
            $toDelete += $branch
            continue
        }
        
        # Check if branch has no unique changes since diverging (handles empty/stash branches)
        # Compare branch tree with merge-base tree
        $mergeBase = git merge-base $targetBranch $branch 2>$null
        if ($mergeBase) {
            $baseTree = git rev-parse "$mergeBase^{tree}" 2>$null
            if ($branchTree -eq $baseTree) {
                # Branch has no net changes since diverging
                $toDelete += $branch
                continue
            }
        }
        
        # Branch has unmerged changes
        $protected += $branch
    }
    
    # Display results
    Write-Host "`nBranches to delete ($($toDelete.Count)):" -ForegroundColor Yellow
    $toDelete | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
    
    if ($protected.Count -gt 0) {
        Write-Host "`nBranches with unmerged changes ($($protected.Count)):" -ForegroundColor Green
        $protected | ForEach-Object { Write-Host "  - $_" -ForegroundColor Green }
    }
    
    # Delete branches
    if ($DryRun) {
        Write-Host "`n[DRY RUN] No branches were deleted." -ForegroundColor Magenta
    } elseif ($toDelete.Count -gt 0) {
        Write-Host "`nDeleting branches..." -ForegroundColor Cyan
        foreach ($branch in $toDelete) {
            # Use -D to force delete since -d might fail for squash-merged branches
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






function nut { param([string]$args) $nutDir='C:/Dropbox/alec_repo/nut'; if (-not(Test-Path "$nutDir/node_modules")) { npm install --prefix $nutDir }; node --no-deprecation $nutDir $args }

