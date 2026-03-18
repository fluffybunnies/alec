---
name: backup-state
description: Backup Claude config, memories, and shell config to Dropbox
disable-model-invocation: true
allowed-tools: Bash, Read, Write, Glob
---

# Backup Claude State

Fresh backup of all Claude-related config files to the Dropbox backup folder.

## Steps

1. Create the backup directories if needed:
   ```
   mkdir -p "/mnt/c/Dropbox/alec_repo/wsl-backup/.claude/memory"
   mkdir -p "/mnt/c/Dropbox/alec_repo/wsl-backup/.claude/skills"
   ```

2. Copy the following files:
   - `~/.bashrc` -> `wsl-backup/.bashrc`
   - `~/.claude/settings.json` -> `wsl-backup/.claude/settings.json`
   - All `*.md` files from `~/.claude/projects/-mnt-c-Users-ahulce-Documents/memory/` -> `wsl-backup/.claude/memory/`
   - All skills from `~/.claude/skills/` -> `wsl-backup/.claude/skills/` (recursive copy)

3. Verify all files were copied by listing the backup directory.

4. Report what was backed up.

## Backup location

`/mnt/c/Dropbox/alec_repo/wsl-backup/`
