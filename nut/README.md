# nut
Keep Windows Alive

## Install
Change `$nutDir` to wherever you downloaded this thing
```ps1
"function nut { `$nutDir='C:/alec/nut'; if (-not(Test-Path `"`$nutDir/node_modules`")) { npm install --prefix `$nutDir }; node --no-deprecation `$nutDir }" | Add-Content $PROFILE
```

## Usage
```ps1
nut
```
