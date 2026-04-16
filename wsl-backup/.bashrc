# ~/.bashrc: executed by bash(1) for non-login shells.
# see /usr/share/doc/bash/examples/startup-files (in the package bash-doc)
# for examples

# If not running interactively, don't do anything
case $- in
    *i*) ;;
      *) return;;
esac

# don't put duplicate lines or lines starting with space in the history.
# See bash(1) for more options
HISTCONTROL=ignoreboth

# append to the history file, don't overwrite it
shopt -s histappend

# for setting history length see HISTSIZE and HISTFILESIZE in bash(1)
HISTSIZE=1000
HISTFILESIZE=2000

# check the window size after each command and, if necessary,
# update the values of LINES and COLUMNS.
shopt -s checkwinsize

# If set, the pattern "**" used in a pathname expansion context will
# match all files and zero or more directories and subdirectories.
#shopt -s globstar

# make less more friendly for non-text input files, see lesspipe(1)
[ -x /usr/bin/lesspipe ] && eval "$(SHELL=/bin/sh lesspipe)"

# set variable identifying the chroot you work in (used in the prompt below)
if [ -z "${debian_chroot:-}" ] && [ -r /etc/debian_chroot ]; then
    debian_chroot=$(cat /etc/debian_chroot)
fi

# set a fancy prompt (non-color, unless we know we "want" color)
case "$TERM" in
    xterm-color|*-256color) color_prompt=yes;;
esac

# uncomment for a colored prompt, if the terminal has the capability; turned
# off by default to not distract the user: the focus in a terminal window
# should be on the output of commands, not on the prompt
#force_color_prompt=yes

if [ -n "$force_color_prompt" ]; then
    if [ -x /usr/bin/tput ] && tput setaf 1 >&/dev/null; then
	# We have color support; assume it's compliant with Ecma-48
	# (ISO/IEC-6429). (Lack of such support is extremely rare, and such
	# a case would tend to support setf rather than setaf.)
	color_prompt=yes
    else
	color_prompt=
    fi
fi

if [ "$color_prompt" = yes ]; then
    PS1='${debian_chroot:+($debian_chroot)}\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '
else
    PS1='${debian_chroot:+($debian_chroot)}\u@\h:\w\$ '
fi
unset color_prompt force_color_prompt

# If this is an xterm set the title to user@host:dir
case "$TERM" in
xterm*|rxvt*)
    PS1="\[\e]0;${debian_chroot:+($debian_chroot)}\u@\h: \w\a\]$PS1"
    ;;
*)
    ;;
esac

# enable color support of ls and also add handy aliases
if [ -x /usr/bin/dircolors ]; then
    test -r ~/.dircolors && eval "$(dircolors -b ~/.dircolors)" || eval "$(dircolors -b)"
    alias ls='ls --color=auto'
    #alias dir='dir --color=auto'
    #alias vdir='vdir --color=auto'

    alias grep='grep --color=auto'
    alias fgrep='fgrep --color=auto'
    alias egrep='egrep --color=auto'
fi

# colored GCC warnings and errors
#export GCC_COLORS='error=01;31:warning=01;35:note=01;36:caret=01;32:locus=01:quote=01'

# some more ls aliases
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'

# Add an "alert" alias for long running commands.  Use like so:
#   sleep 10; alert
alias alert='notify-send --urgency=low -i "$([ $? = 0 ] && echo terminal || echo error)" "$(history|tail -n1|sed -e '\''s/^\s*[0-9]\+\s*//;s/[;&|]\s*alert$//'\'')"'

# Alias definitions.
# You may want to put all your additions into a separate file like
# ~/.bash_aliases, instead of adding them here directly.
# See /usr/share/doc/bash-doc/examples in the bash-doc package.

if [ -f ~/.bash_aliases ]; then
    . ~/.bash_aliases
fi

# enable programmable completion features (you don't need to enable
# this, if it's already enabled in /etc/bash.bashrc and /etc/profile
# sources /etc/bash.bashrc).
if ! shopt -oq posix; then
  if [ -f /usr/share/bash-completion/bash_completion ]; then
    . /usr/share/bash-completion/bash_completion
  elif [ -f /etc/bash_completion ]; then
    . /etc/bash_completion
  fi
fi
export PATH="$HOME/.local/bin:$PATH"
alias claude='claude --dangerously-skip-permissions'
export BROWSER=/home/ubuntu/.local/bin/wsl-open


# =============================================================================
# Custom profile — migrated from .profile + PowerShell profile
# =============================================================================

# Detect WSL
if grep -qiE '(microsoft|wsl)' /proc/version 2>/dev/null; then
  IS_WSL=1
fi

# --- Core settings -----------------------------------------------------------

export EDITOR=vim
export GIT_MERGE_AUTOEDIT=no

# --- Utility helpers ---------------------------------------------------------

echocute() {
  echo "$1"
  eval "$1"
}

escape_bash_val() {
  printf '%q\n' "$1"
}

rprofile() {
  source ~/.bashrc
}

smiles() {
  local faces=(
    '( ͡° ͜ʖ ͡°)' '¯\_(ツ)_/¯' '(╯°□°)╯︵ ┻━┻' '┬─┬ノ( º _ ºノ)'
    '(☞ﾟヮﾟ)☞' '(⌐■_■)' '(•_•)' 'ᕕ( ᐛ )ᕗ' '(ノಠ益ಠ)ノ彡┻━┻'
    '(づ￣ ³￣)づ' 'ʕ•ᴥ•ʔ' '(ง •̀_•́)ง' '( ˘ ³˘)♥' '(¬‿¬)'
    '(ᵔᴥᵔ)' '(◕‿◕✿)' 'ಠ_ಠ' '(⊙_⊙)' '(ﾉ◕ヮ◕)ﾉ*:・ﾟ✧'
    '(；一_一)' '( ⚆ _ ⚆ )' '(╥_╥)' '٩(͡๏̯͡๏)۶' '(ʘ‿ʘ)'
    '凸(¬‿¬)凸' '(☉_☉)' '(¬_¬)' 'щ(ゝω)ш' '(⌒‿⌒)'
  )
  echo "${faces[$((RANDOM % ${#faces[@]}))]}"
}

# --- Git shortcuts -----------------------------------------------------------

poo() {
  # Add all, commit, pull, push to current branch
  # poo fix the thing    — commits with message "fix the thing"
  # poo                  — commits with a random smiles face
  local currentBranch
  currentBranch=$(git symbolic-ref --short HEAD) || { echo "Not on a branch"; return 1; }
  local msg="$*"
  if [ -z "$msg" ]; then msg=$(smiles); fi
  local gitRoot
  gitRoot=$(git rev-parse --show-toplevel) || return 1
  git -C "$gitRoot" add --all .
  git commit -a -m "$msg" || return 1
  git pull origin "$currentBranch" || return 1
  git push origin "$currentBranch"
}

mastif() {
  # Sync local branch with origin. Defaults to master.
  # mastif           — fetch + checkout + pull master
  # mastif develop   — fetch + checkout + pull develop
  local branch="${1:-master}"
  git fetch && git checkout -f "$branch" && git pull origin "$branch" && git fetch --tags
}

gbb() {
  # Switch to previous branch (git checkout -)
  git checkout -
}

gdel() {
  # Delete local branches whose remote tracking branch no longer exists.
  # Prunes remotes, checks out target branch, then deletes orphaned locals.
  # gdel             — uses master as base
  # gdel develop     — uses develop as base
  # gdel --dry-run   — preview without deleting
  local targetBranch="master"
  local dryRun=0
  for arg in "$@"; do
    case "$arg" in
      --dry-run) dryRun=1 ;;
      *) targetBranch="$arg" ;;
    esac
  done

  echo "Fetching remote branches..."
  git fetch --prune

  # Checkout and update target branch
  git checkout "$targetBranch" 2>/dev/null || { echo "Failed to checkout $targetBranch"; return 1; }
  echo "Updating $targetBranch..."
  git pull origin "$targetBranch"

  echo ""
  echo "Analyzing branches..."

  local -a toDelete=()
  local -a kept=()

  # Get all remote branch names (strip 'origin/' prefix)
  local remoteBranches
  remoteBranches=$(git branch -r | sed 's|^ *origin/||' | grep -v '^HEAD')

  while IFS= read -r branch; do
    branch=$(echo "$branch" | sed 's/^[* ] //')
    [ -z "$branch" ] && continue
    [ "$branch" = "$targetBranch" ] && continue

    # Check if upstream tracking ref still exists
    local upstream
    upstream=$(git rev-parse --abbrev-ref "${branch}@{upstream}" 2>/dev/null)
    if [ $? -eq 0 ] && [ -n "$upstream" ]; then
      kept+=("$branch (tracking: $upstream)")
      continue
    fi

    # Check if remote has a branch with the same name
    if echo "$remoteBranches" | grep -qx "$branch"; then
      kept+=("$branch (name match)")
      continue
    fi

    toDelete+=("$branch")
  done < <(git branch | sed 's/^[* ] //')

  # Display results
  echo ""
  echo "Branches to delete (no remote branch) (${#toDelete[@]}):"
  for b in "${toDelete[@]}"; do echo "  - $b"; done

  if [ ${#kept[@]} -gt 0 ]; then
    echo ""
    echo "Branches kept (remote exists) (${#kept[@]}):"
    for b in "${kept[@]}"; do echo "  - $b"; done
  fi

  if [ $dryRun -eq 1 ]; then
    echo ""
    echo "[DRY RUN] No branches were deleted."
  elif [ ${#toDelete[@]} -gt 0 ]; then
    echo ""
    echo "Deleting branches..."
    for b in "${toDelete[@]}"; do
      git branch -D "$b"
    done
    echo ""
    echo "Current branches:"
    git branch
  else
    echo ""
    echo "No branches to delete."
  fi
}

# --- Sudo helper -------------------------------------------------------------

bitch() {
  # Shortcut for sudo.
  # bitch please       — re-run last command with sudo
  # bitch apt update   — same as: sudo apt update
  if [ "$1" = "please" ]; then
    eval "sudo $(fc -ln -1)"
  else
    sudo "$@"
  fi
}

# --- Grep helpers ------------------------------------------------------------

GREPV_ARGS_FILE="/tmp/.grepv_last_args"

grepv() {
  # Recursive grep excluding common noise directories.
  # grepv 'pattern' ./src
  # grepv -i 'pattern' .
  # Then use gropen to open all matched files.
  echo "$*" > "$GREPV_ARGS_FILE"
  grep -R "$@" | grep -v 'node_modules/' | grep -v '\.git/' | grep -v 'Binary' | grep -v 'bin/' | grep -v 'obj/' | grep -v 'package-lock'
}

gropen() {
  # Open all files from the last grepv in your editor.
  # Run grepv first, then gropen to open matched files.
  # gropen              — open files from last grepv
  # gropen -R 'pat' .   — grep + open in one step
  local argsFile="$GREPV_ARGS_FILE"
  local results

  if [ $# -gt 0 ]; then
    # Direct mode: grep and open
    results=$(grepv "$@")
  elif [ -f "$argsFile" ]; then
    # Replay mode: re-run last grepv
    local savedArgs
    savedArgs=$(cat "$argsFile")
    results=$(eval "grepv $savedArgs")
  else
    echo "No previous grepv invocation found."
    return 1
  fi

  echo "$results"

  local files
  files=$(echo "$results" | sed -n 's/^\([^:]*\):.*/\1/p' | sort -u)
  if [ -z "$files" ]; then
    echo "No files matched."
    return 1
  fi

  while IFS= read -r f; do
    topen "$f"
  done <<< "$files"
}

# --- File openers ------------------------------------------------------------

topen() {
  # Open file in VS Code, creating it (and parent dirs) if needed.
  # topen path/to/new/file.txt
  local filePath="$1"
  [ -z "$filePath" ] && { echo "Please specify a file path"; return 1; }
  local fileDir
  fileDir=$(dirname "$filePath")
  [ -d "$fileDir" ] || mkdir -p "$fileDir"
  [ -f "$filePath" ] || touch "$filePath"
  code "$filePath"
}

copen() {
  # Open file in Cursor, creating it (and parent dirs) if needed.
  # copen path/to/new/file.txt
  local filePath="$1"
  [ -z "$filePath" ] && { echo "Please specify a file path"; return 1; }
  local fileDir
  fileDir=$(dirname "$filePath")
  [ -d "$fileDir" ] || mkdir -p "$fileDir"
  [ -f "$filePath" ] || touch "$filePath"
  cursor "$filePath"
}

wopen() {
  # Open a file or URL in the default browser.
  # wopen index.html
  # wopen https://example.com
  local target="$1"
  [ -z "$target" ] && { echo "Please specify a file or URL"; return 1; }
  # Resolve to absolute path if it's a local file
  if [ -e "$target" ]; then
    target=$(realpath "$target")
  fi
  if [ "$IS_WSL" ]; then
    wsl-open "$target"
  else
    xdg-open "$target"
  fi
}

open() {
  # Open file/dir in the native file manager (or default app).
  # open .
  # open ~/Documents
  local target="${1:-.}"
  if [ -e "$target" ]; then
    target=$(realpath "$target")
  fi
  if [ "$IS_WSL" ]; then
    explorer.exe "$(wslpath -w "$target" 2>/dev/null || echo "$target")" &>/dev/null &
  else
    xdg-open "$target"
  fi
}

bopen() {
  # Open a file in both your editor and browser.
  # bopen index.html
  topen "$1"
  wopen "$1"
}

# --- Profile management ------------------------------------------------------

saveprofile() {
  # Back up .bashrc to Dropbox.
  # saveprofile
  local src="$HOME/.bashrc"
  local destDir
  if [ "$IS_WSL" ]; then
    destDir="/mnt/c/Dropbox/alec_repo/wsl-backup"
  else
    destDir="$HOME/Dropbox/alec_repo"
  fi
  mkdir -p "$destDir"
  local dest="$destDir/.bashrc"
  echo "Saving $src -> $dest"
  cp "$src" "$dest"
  echo "Saved. Modified: $(stat -c '%y' "$dest" 2>/dev/null || stat -f '%Sm' "$dest" 2>/dev/null)"
}

# .NET SDK
export DOTNET_ROOT="$HOME/.dotnet"
export PATH="$DOTNET_ROOT:$PATH"
