# LiveLawyer

The source for the app can be found in `./LiveLawyerApp`, and Expo has generated its own README there to explain how to get started.

## WARNING FOR WINDOWS USERS!

When you clone the repository, make sure that the cloning process does not convert the repository's LF line endings to CRLF if you intend to work inside the dev container (because CRLF line endings will break everything!):

```powershell
git clone --config core.autocrlf=input git@github.com:Gabrielbozza7/LiveLawyer.git
```

## Dev Container Guide

Paths in this section (including the paths where files should be created) of the README will be relative to the inside of the `.devcontainer` directory in this repository unless otherwise specified.

Do the following as a one-time setup for the dev container to work properly:

1. Ensure that you have Docker Engine installed and running on your host machine.
2. Create a file `ip.txt` with the first line being your local IPv4 address that **corresponds to the network interface that links to the same network that your mobile device will use**. This is the only line that needs to be in the file, and it should contain only the local IPv4 address (no port or IPv6 address). This file will be ignored by Git and is specifically for you. If you do not complete this step, **the container will still run, but you might not be able to connect Expo Go to the test app**. If your IPv4 address for the appropriate network interface changes, you will have to change the IP in the file (and restart the any running Bash shell in a terminal in the container for the change to be reflected).
3. *(Optional)* Create a directory `bind` with an arbitrary Bash script `startup.sh` of your choice inside it. The environment variable `BIND_DIR` will be accessible in the script (which contains the path to the `bind` directory), and the script will run the first time you open a terminal in the container each time the container starts. The script will be run by your user, `dev`. The `bind` directory will be ignored by Git and is specifically for you. This might be handy if you want to do something such as passing an SSH key into the container for use with Git inside the container.
4. Build the container. If you are using the Dev Containers extension for Visual Studio Code, clicking the "Reopen in Container" prompt upon opening the repository as a workspace should do this. Make sure that you grant Docker access to host services on your network if prompted.
5. From within the container, open a terminal and run `setup` (a custom command created for this container), which should work in any directory. This will use NPM to install the app's dependencies to the proper place. You will have to repeat this step if the dependencies change (as you would normally have to with `npm install`).
6. *(Optional)* Create an empty text file `.bash_history` from within the container (but still relative to the path specified previously). If this file exists, it will carry over your Bash history from commands executed inside the container between container restarts. This file will be ignored by Git and is specifically for you.
7. *(Optional)* If you are planning to use Git from within the container, you should configure your local repository's settings appropriately:

```bash
git config user.name GITHUB_USERNAME
git config user.email GITHUB_EMAIL
git config pull.ff true
git config pull.rebase false
git config core.autocrlf input
```

After the container setup process, you should be good to start working and testing! You can run `run` (another custom command) from any directory to run the app (like with `npx expo start`) in a testing environment, which gives you the QR code to scan for use with Expo Go.
