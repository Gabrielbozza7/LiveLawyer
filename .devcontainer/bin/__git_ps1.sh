#!/bin/bash

BRANCH=`git symbolic-ref --short HEAD 2>/dev/null`
if [ $? = 128 ]; then
    printf %s ""
else
    printf "@%s" "$BRANCH"
fi
