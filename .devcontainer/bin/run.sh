#!/bin/bash

RETURN_PATH="$PWD"
EVENTUAL_EXIT_CODE="0"

function handle_sigint {
    cd "$RETURN_PATH"
    EVENTUAL_EXIT_CODE="130"
}
trap handle_sigint INT

if [ "$1" = "app" ]; then
    cd "$REPOSITORY_ROOT""/LiveLawyerApp"
    export REACT_NATIVE_PACKAGER_HOSTNAME=`head -n 1 "$REPOSITORY_ROOT""/.devcontainer/ip.txt"`
    echo "NOTE: \$REACT_NATIVE_PACKAGER_HOSTNAME set to \"$REACT_NATIVE_PACKAGER_HOSTNAME\""
    npx expo start "$2" "$3" "$4"
    EVENTUAL_EXIT_CODE="$?"
elif [ "$1" = "backend" ]; then
    cd "$REPOSITORY_ROOT""/LiveLawyerBackend"
    npm start "$2" "$3" "$4"
    EVENTUAL_EXIT_CODE="$?"
elif [ "$1" = "web" ]; then
    cd "$REPOSITORY_ROOT""/LiveLawyerWeb"
    npm run dev "$2" "$3" "$4"
    EVENTUAL_EXIT_CODE="$?"
else
    echo "Unknown command variation; try one of these:"
    echo "  run app"
    echo "  run backend"
    echo "  run web"
    EVENTUAL_EXIT_CODE="1"
fi

cd "$RETURN_PATH"
bash -c "exit $EVENTUAL_EXIT_CODE"
