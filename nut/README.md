# nut
Keep Windows Alive

## Install
Change `$nutDir` to wherever you downloaded this thing. Then paste it into Powershell.
```ps1
"function nut { param([string]`$args) `$nutDir='C:/alec/nut'; if (-not(Test-Path `"`$nutDir/node_modules`")) { npm install --prefix `$nutDir }; node --no-deprecation `$nutDir `$args }`r`n" | Add-Content $PROFILE; . $PROFILE
```

## Usage
```ps1
nut        # Run silently
nut -v     # Run with logging
```
