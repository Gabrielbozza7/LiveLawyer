#!/bin/bash

# This script should run every time the user first opens the shell, regardless of whether the repository root is set up properly.

if [ "$TERM" = "xterm-256color" ]; then
    PS1="\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[33m\]\`__git_ps1\`\[\033[00m\]$ "
else
    PS1="\u@\h:\w\`__git_ps1\`$ "
fi
export PS1="$PS1"
export REACT_NATIVE_PACKAGER_HOSTNAME=`head -n 1 "$REPOSITORY_ROOT""/.devcontainer/ip.txt"`
export PATH="$PATH":~/bin
