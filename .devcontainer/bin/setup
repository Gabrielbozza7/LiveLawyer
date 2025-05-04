#!/bin/bash

RETURN_PATH="$PWD"

cd "$REPOSITORY_ROOT"/LiveLawyerApp
echo "Installing Node dependencies for LiveLawyerApp..."
npm install
echo ""

cd "$REPOSITORY_ROOT"/LiveLawyerBackend
echo "Installing Node dependencies for LiveLawyerBackend..."
npm install
echo ""

cd "$REPOSITORY_ROOT"/LiveLawyerLibrary
echo "Installing Node dependencies for LiveLawyerLibrary..."
npm install
echo ""

cd "$REPOSITORY_ROOT"/LiveLawyerWeb
echo "Installing Node dependencies for LiveLawyerWeb..."
npm install
echo ""

echo "Finished installing dependencies!"
cd "$RETURN_PATH"
