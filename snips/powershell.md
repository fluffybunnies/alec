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


### Remap Alt to Ctrl
Use PowerToys


### find . equivalent
```
function findot() {
  gci -r $args[0] | Select-Object -ExpandProperty FullName
}
```


### open
```
function open {
  explorer $args[0]
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
  start chrome $args[0]
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


### SymLink
Similar to: `ln -s`
```
New-Item -Path C:\DataStore\51degrees.dat -ItemType SymbolicLink -Value C:\DataStore\Tracking\51degrees.dat
```


### Fix tab expansion of tilde
Temp hack fix: https://github.com/PowerShell/PowerShell/issues/20750#issuecomment-1822567842
Until this PR gets released: https://github.com/PowerShell/PowerShell/pull/21529


### Create self-signed certificate
```
$cert = New-SelfSignedCertificate -certstorelocation cert:\localmachine\my -dnsname localhost
$pwd = ConvertTo-SecureString -String 'centerfieldssl1!' -Force -AsPlainText
$path = 'cert:\localMachine\my\' + $cert.thumbprint
Export-PfxCertificate -cert $path -FilePath ~\new.pfx -Password $pwd

$pwd = ConvertTo-SecureString -String 'centerfieldssl1!' -Force -AsPlainText
Import-PfxCertificate -FilePath ~\new.pfx -CertStoreLocation Cert:\LocalMachine\Root -Password  $pwd
```

