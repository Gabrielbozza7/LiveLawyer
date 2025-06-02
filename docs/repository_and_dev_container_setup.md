# Repository and Dev Container Setup

Paths in this guide (including the paths where files should be created) will be **relative to the root of the repository** unless otherwise specified.

Complete the following steps as a one-time setup for the dev container to work properly.

## Part 1: Cloning the Repository

1. After making sure that you have been added as a collaborator to the project repository, clone the repository to your local machine such that the files in the repository retain their LF line endings. If you are using a Windows host, you should perform the clone with this command to ensure that the endings aren't converted to CRLF:

```powershell
git clone --config core.autocrlf=input git@github.com:Gabrielbozza7/LiveLawyer.git
```

If you are having issues with permissions, refer to the previous guide, [GitHub SSH Key Setup](./github_ssh_key_setup.md), and repeat the steps under the [Testing the Private Key for GitHub Authentication](./github_ssh_key_setup.md#testing-the-private-key-for-github-authentication) section. Try the clone again in the same shell after adding your key.

## Part 2: Running the Container

1. Ensure that you have [Docker Engine](https://docs.docker.com/engine/install/) installed and running on your host machine. You do not have to separately install this if you already have installed [Docker Desktop](https://docs.docker.com/desktop/) because that comes with Docker Engine.

2. Build the container. If you are using the Dev Containers extension for Visual Studio Code, clicking the "Reopen in Container" prompt upon opening the **repository root** as a workspace should do this. Running the container without the Visual Studio Code extension has not been tested, but tools that support the [Development Container Specification](https://containers.dev/implementors/spec/) should work.

3. Make sure that you grant Docker access to host services on your network if prompted.

4. Note that this setup might result in poor IO performance due to the use of a bind mount if you are not on a Linux-based host. If you want to improve performance (which is highly encouraged if you are using a non-Linux host), follow the next optional part of instructions to configure your container to use a volume (which has better IO performance) instead. If you are not going to use a volume, you can skip to [Part 3: Miscellaneous Container Configuration](#part-3-miscellaneous-container-configuration).

## (Optional Part) Container Volume Setup

You can use a Docker volume instead of a normal bind mount to improve performance, and this optional part of the guide will explain how to set that up.

1. On the host relative to the root of the repository, change `.devcontainer/devcontainer.json` to this (but do not commit changes) (you may ignore the warning at the top of the file for now because you will be reverting this change later):

```json
// TEMPORARY
{
    "name": "LiveLawyer",
    "build": {
        "dockerfile": "Dockerfile"
    },
    "containerUser": "root",
    "remoteUser": "root",
    "runArgs": ["-v", "livelawyer-source:/volume"]
}
```

2. Rebuild the container and open a shell inside it. If the build process complains about the volume not existing when you try to rebuild the container, try creating the volume with `docker volume create livelawyer-source` on the host, then try to rebuild again. After you are in a shell in the container, issue the following commands in the shell one after another (not as a script):

```bash
chown dev /volume
su dev
cp -r . /volume
exit
exit
```

That copy operation might take a while, but make sure that it finishes!

3. After that is done, return to that `.devcontainer/devcontainer.json` file **on the host**. Revert its contents to what they were before step 1 of this part (which you can do by pressing "Undo" a bunch of times, copying the original version, or running `git restore .devcontainer/devcontainer.json`). Then, still on the host, modify that original version to contain these two new properties:

```json
{
    // Other properties like "name" and "build" should be here and should stay, just add the two properties below:
    "workspaceMount": "source=livelawyer-source,target=/workspace,type=volume",
    "workspaceFolder": "/workspace",
}
```

4. Rebuild the container once again. If the build process complains about the workspace "not existing" while using Visual Studio Code with the Dev Containers extension, try to open the workspace located at `/workspace` from that prompt.

5. Revert the contents of the `.devcontainer/devcontainer.json` file **inside the container, not on the host** to what they were before step 1 of this part. You have to do this again because the modified version was copied into the volume during step 2, and make sure that you **do not** include the additional properties from step 3 (the file in the container should be the same as it is on the remote repository).

At this point, the volume setup should be complete! The version of `.devcontainer/devcontainer.json` on the host should have the two extra properties, and the version in the container should be identical to how it was originally received from the remote repository. On the host, you only need to keep the `.devcontainer` directory to be able to build and run the container; the rest of the repository (on the host) (including the `.git` and subproject directories) can be discarded since the full local repository lives in the volume now (which might be advisable to avoid confusion).

Note that this means that any future changes to the container setup (such as a new Dockerfile, for example) will have to be manually applied back to the host. Warnings for this appear at the top of files where this can cause an issue.

## Part 3: Miscellaneous Container Configuration

1. Create a file `.devcontainer/ip.txt` in the container with the first line being your local IPv4 address that **corresponds to the network interface that links to the same network that your mobile device will use**. This is the only line that needs to be in the file, and it should contain only the local IPv4 address (no port or IPv6 address). This file will be ignored by Git and is specifically for you. If you do not complete this step, **the container will still run, but you might run into connection issues when testing the app**. If your IPv4 address for the appropriate network interface changes, you will have to change the IP in the file (and restart the any running Bash shell in a terminal in the container for the change to be reflected).

2. Add this same IP address as environment variables in certain `.env` files in the container. These `.env` files should not exist yet if you have been following the setup guides in order; create them now if they don't exist:
    - Set the value of the variable `BACKEND_IP` in `LiveLawyerLibrary/.env` to this IP address.
        - For example, if the IP is `192.168.192.168`, there should be a line in that file that exactly reads as `BACKEND_IP=192.168.192.168`.
    - If you are running the backend server on a port other than `4000` (it is `4000` by default), also set the value of the variable `BACKEND_PORT` in `LiveLawyerLibrary/.env` to the server port that you are using.
    - Set the value of the variable `EXPO_PUBLIC_BACKEND_IP` in `LiveLawyerApp/.env` to this IP address.
        - Ideally, the IP shouldn't be duplicated so much, so it would be a great idea if someone knows how to and wants to change this to avoid redundancy! The removal of the duplication was attempted with `LiveLawyerApp/.env`, but that didn't end up working due to the inability of React Native to read other non-main `.env` files.
    - If you are running the backend server on a port other than `4000`, also set the value of the variable `EXPO_PUBLIC_BACKEND_PORT` in `LiveLawyerApp/.env` to the server port that you are using.

3. *(Optional)* Create an empty text file `.devcontainer/.bash_history` in the container. If this file exists, it will carry over your `bash` history from commands executed inside the container between container restarts. This file will be ignored by Git and is specifically for you.

4. *(Optional)* If you are planning to use Git from within the container, you should configure your local repository's settings appropriately by running these commands in the container, replacing `GITHUB_USERNAME` and `GITHUB_EMAIL` with your GitHub username and email, respectively:

```bash
git config user.name GITHUB_USERNAME
git config user.email GITHUB_EMAIL
git config pull.ff true
git config pull.rebase false
git config core.autocrlf input
```

5. *(Optional)* In the container, create a directory `.devcontainer/bind` with an arbitrary `bash` script `startup.sh` of your choice inside it. The environment variable `BIND_DIR` will be accessible in the script (which contains the path to the `.devcontainer/bind` directory), and the script will run the first time you open a terminal in the container each time the container starts. The script will be run by your user, `dev`. The `bind` directory will be ignored by Git and is specifically for you. This might be handy if you want to do something such as passing an SSH key into the container for authentication with GitHub inside the container.
    - If you do want to add a `startup.sh` script that will allow you to authenticate with GitHub from within the container, follow these additional steps:
        - Copy your private key file into `.devcontainer/bind`. In the next steps, replace `KEY_NAME` with the name of this file that contains your private key.
        - Set the contents of `.devcontainer/bind/startup.sh` to the following:
        ```bash
        #!/bin/bash
        cp "$BIND_DIR"/KEY_NAME ~/.ssh
        chmod 600 ~/.ssh/KEY_NAME
        ```
        - Run the command `git config core.sshCommand "ssh -i ~/.ssh/KEY_NAME`.
        - Rebuild the container. You will know that you have performed this key setup correctly if after rebuilding and running `ssh -T git@github.com` you encounter a message that ends with `You've successfully authenticated, but GitHub does not provide shell access.`.

## Part 4: Installing Dependencies and Running Services

1. From anywhere in the container, run `setup` (a custom command created for this container). This will use NPM to install the subprojects' dependencies to the proper place. You will have to repeat this step if the dependencies change (as you would normally have to with `npm install`).

At this point, you should be good to start running services! You can run `run` (another custom command) from any directory to get a list of subcommands to run any of the subprojects' services. Each of the three services should be running for a proper testing environment.
- If you are looking to edit one of the custom commands or make a new one, take a look at `.devcontainer/bin`. Note that `.devcontainer/bin/__add_bin.sh` runs when the container is rebuilt, so you should edit that file to register new commands. Existing custom commands are in the same directory.

If you have been following the setup guides in order, you don't have all of the configuration ready yet, but that will be explained over the course of the next few guides.
