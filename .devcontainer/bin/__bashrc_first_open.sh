#!/bin/bash

# This script should run one time per container rebuild when the user first opens the shell.
# It should not run if the repository root is not set up properly (it should have ".devcontainer" and the various subprojects in it).

ln -sf "$REPOSITORY_ROOT""/.devcontainer/.bash_history" ~/.bash_history
bash "$REPOSITORY_ROOT""/.devcontainer/bin/__add_bin.sh"
if [ -f "$REPOSITORY_ROOT""/.devcontainer/bind/startup.sh" ]; then
    export BIND_DIR="$REPOSITORY_ROOT""/.devcontainer/bind"
    bash "$BIND_DIR""/startup.sh"
    unset BIND_DIR
fi
