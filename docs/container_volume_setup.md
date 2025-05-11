## Container Volume Setup

You can use a Docker volume instead of a normal bind mount to improve performance. This guide will explain how to set that up, and it assumes that you have already performed the container setup from [here](./dev_container_setup.md).

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
	"runArgs": ["-p=8081:8081", "-p=3000:3000", "-p=4000:4000", "-v", "livelawyer-source:/volume"]
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
	"runArgs": ["-p=8081:8081", "-p=3000:3000", "-p=4000:4000"]
}
```

Once again, rebuild the container. If the build process complains about the workspace "not existing" while using Visual Studio Code with the Dev Containers extension, try to open the workspace located at `/workspace` from that prompt. At this point, the volume setup should be complete! You can now revert the changes made to `.devcontainer/devcontainer.json` from within the volume (but make sure to keep the changes on the host). On the host, you only need to keep the `.devcontainer` directory to be able to build and run the container; the rest of the repository (on the host) can be discarded since it lives in the volume now.

Note that this means that any future changes to the container setup (such as a new Dockerfile, for example) will have to be manually applied back to the host.
