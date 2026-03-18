---
name: Self-restart means exit
description: When asked to restart, just exit cleanly. Do not attempt to relaunch Claude — the shells conflict.
type: feedback
---

When the user asks Claude to restart itself, just exit cleanly (e.g. `/exit` or signal exit). Do NOT attempt to relaunch Claude from within Claude — the shell layering causes conflicts.

**Why:** Previous attempts using `touch /tmp/.claude-restart && kill $PPID`, `exec claude`, and `nohup` all failed due to conflicting shell contexts.

**How to apply:** If the user says "restart", just exit. They will manually relaunch.
