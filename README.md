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
4. Build the container. If you are using the Dev Containers extension for Visual Studio Code, clicking the "Reopen in Container" prompt upon opening the repository as a workspace should do this. Make sure that you grant Docker access to host services on your network if prompted. Note that this might result in poor IO performance due to the use of a bind mount if you are not on a Linux-based host. If you want to improve performance, follow the guide in the **Volume Setup Guide** section, located after these instructions, and return here when complete.
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

## Volume Setup Guide

You can use a Docker volume instead of a normal bind mount to improve performance. This guide will explain how to set that up.

First, on the host relative to the root of the repository, change `.devcontainer/devcontainer.json` to this:

```json
{
	"name": "LiveLawyer",
	"forwardPorts": [8081],
	"build": {
		"dockerfile": "Dockerfile"
	},
	"containerUser": "root",
	"remoteUser": "root",
	"runArgs": ["-p=8081:8081", "-v", "livelawyer-source:/volume"]
}
```

Then, rebuild the container and open a shell inside it. If the build process complains about the volume not existing, try creating the volume with `docker volume create livelawyer-source` on the host, then try again. After you are in a shell in the container, issue the following commands in the shell one after another (not as a script):

```bash
chown dev /volume
su dev
cp -r . /volume
exit
exit
```

That copy operation might take a while! After that is done, return to that `.devcontainer/devcontainer.json` file on the host and update it to this:

```json
{
	"name": "LiveLawyer",
	"forwardPorts": [8081],
	"build": {
		"dockerfile": "Dockerfile"
	},
	"workspaceMount": "source=livelawyer-source,target=/workspace,type=volume",
	"workspaceFolder": "/workspace",
	"runArgs": ["-p=8081:8081"]
}
```

Once again, rebuild the container. If the build process complains about the workspace "not existing" while using Visual Studio Code with the Dev Containers extension, try to open the workspace located at `/workspace` from that prompt. At this point, the volume setup should be complete! You can now revert the changes made to `.devcontainer/devcontainer.json` from within the volume (but make sure to keep the changes on the host). On the host, you only need to keep the `.devcontainer` directory to be able to build and run the container; the rest of the repository (on the host) can be discarded since it lives in the volume now.

Note that this means that any future changes to the container setup (such as a new Dockerfile, for example) will have to be manually applied back to the host.
