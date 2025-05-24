#!/bin/bash

# This script exists so that the commands can be edited without needing to update the host files.
# However, the container would still need to be rebuilt.

if [ -d ~/bin ]; then
    rm -r ~/bin
fi
mkdir ~/bin

function add_bin {
    cp "$REPOSITORY_ROOT""/.devcontainer/bin/""$1"".sh" ~/bin/"$1"
}

add_bin __add_bin
add_bin __bashrc_every_open
add_bin __bashrc_first_open
add_bin __git_ps1
add_bin run
add_bin setup

chmod u+x ~/bin/*
