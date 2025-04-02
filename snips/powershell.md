# PowerShell


### Edit bash.rc equivalent
```
vim $profile
```


### Common mac shortkeys
```
Set-PSReadLineKeyHandler -Key Ctrl+u -Function BackwardDeleteLine
Set-PSReadlineKeyHandler -Key Tab -Function MenuComplete
#Set-PSReadLineKeyHandler -Key Ctrl+k -Function ClearScreen
Set-PSReadLineKeyHandler -Key Ctrl+k -ScriptBlock {
  [Microsoft.PowerShell.PSConsoleReadLine]::RevertLine()
  [Microsoft.PowerShell.PSConsoleReadLine]::Insert('cls')
  [Microsoft.PowerShell.PSConsoleReadLine]::AcceptLine()
}
```


### Remap Caps-Lock to ESC
You can also remap keys with PowerToys, but it won't work inside all applications (e.g. Powershell)
```
$hexified = "00,00,00,00,00,00,00,00,03,00,00,00,3a,00,46,00,01,00,3a,00,00,00,00,00".Split(',') | % { "0x$_"};
$kbLayout = 'HKLM:\System\CurrentControlSet\Control\Keyboard Layout';
New-ItemProperty -Path $kbLayout -Name "Scancode Map" -PropertyType Binary -Value ([byte[]]$hexified);
```



### Restore Classic Right-Click Context Menu
```
reg.exe add "HKCU\Software\Classes\CLSID\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}\InprocServer32" /f /ve
```



### Swap Fn and Ctrl
If your keyboard has the Fn key outside the Ctrl key, you'll want to swap these at the BIOS level. Why? Fn doesn't register as its own keypress in Windows, it is special.



### Remap Alt to Ctrl, and Fix Home/End Cursor Movement
Use PowerToys
#### Keys
1. Alt (left) to Ctrl (left)
2. Ctrl (left) to Alt (left)
#### Shortcuts
1. Ctrl (left) + Tab to Alt (left) + Tab
2. Ctrl (left) + Left to Home
3. Ctrl (left) + Up to Ctrl (left) + Home
4. Ctrl (left) + Right to End
5. Ctrl (left) + Down to Ctrl (left) + End
6. Alt (left) + Left to Ctrl (left) + Left
7. Alt (left) + Right to Ctrl (left) + Right
8. Ctrl (left) + Shift + Up to Ctrl (left) + Shift + Home
9. Ctrl (left) + Shift + Down to Ctrl (left) + Shift + End



### Install sudo on Windows 11
Settings > System > For developers



### Fix tab expansion of tilde
Temp hack fix: https://github.com/PowerShell/PowerShell/issues/20750#issuecomment-1822567842
Until this PR gets released: https://github.com/PowerShell/PowerShell/pull/21529



### Resolve Unix-Formatted Paths
E.g.: Replace forward slash with back slash
```
Resolve-Path "~/Documents/README.md"
```



### SymLink
Similar to: `ln -s`
```
New-Item -Path C:\DataStore\51degrees.dat -ItemType SymbolicLink -Value C:\DataStore\Tracking\51degrees.dat
```



### find . equivalent
```
function findot() {
  gci -r $args[0] | Select-Object -ExpandProperty FullName
}
```


### open
```
function open {
  explorer $(Resolve-Path "$($args[0])")
}
```


### topen
```
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
```


### wopen
```
function wopen {
  start chrome $(Resolve-Path "$($args[0])")
}
```


### rm -rf
Unfortunately, "-f" is ambiguous in PS
```
function rimraf {
  # Same as shorthand: rm -r -Force
  Remove-Item $args[0] -Recurse -Force
}
```


### mastif
```
function mastif {
  $branch=$args[0]
  if (!$branch) {
    $branch="master"
  }
  git fetch && git checkout -f $branch && git pull origin $branch && git fetch --tags
}
```


### gdel
```
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
```


### poo
```
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
```




