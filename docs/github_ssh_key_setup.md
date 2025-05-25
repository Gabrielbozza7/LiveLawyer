# GitHub SSH Key Setup

If you do not have an SSH key set up for this project, you should set one up now, which is what this guide covers. While it is possible to authenticate with GitHub using other means, this is a known working method that the first team used to authenticate using the command line inside the dev container. SSH authentication is not strictly required in order to work on this repository, but the dev container was set up in such a way that directly accomodates this method.

## Generating the Public and Private Keys

1. Make sure that you are working in a shell that has OpenSSH tooling (which is probably already installed). Create an SSH key pair with the following command. You can use a different algorithm (such as RSA) if you'd like, but you should use Ed25519 if you aren't sure. You can replace the comment (the argument after the `-C`) with whatever you want, as it just serves as an identifier for the key, but you should probably make the comment relate to the project so that you know what the key's purpose is if you forget later.

```bash
ssh-keygen -t ed25519 -C "Live Lawyer Key for [Your Name/Email]"
```

2. This command will then prompt you to further setup the key; you can include a passphrase if you'd like. It is recommended that you don't use the default name to avoid getting confused if you have multiple keys. Make sure that the keys are saved to a secure location, and take note of exactly where the output says the key pair will be saved.

You should have obtained two files from the last step, with one of the files having a `.pub` extension. The one with the `.pub` extension is your public key and is safe to share with GitHub, and the one without the extension is your private key and should not be shared.

## Associating the Key Pair with GitHub

1. Click on your profile picture in the top right.

2. In the menu that opens, click "Settings".

3. In the settings, under the "Access" section on the left, click "SSH and GPG keys".

4. Click the green "New SSH key" button.

5. Give the key an arbitrary title (that should ideally be informative of the key's purpose). Make sure that the key type is set to "Authentication Key".

6. Paste the text contents of the *public* key file (the one that ends in `.pub`) into the "Key" box.

7. Click the green "Add SSH key" button.

8. You might be prompted to confirm that you want to add the key or might have to go through 2FA, but after that, you should now see the key in the list on the "SSH and GPG keys" page.

Now that you have added that public key to GitHub, the private key can be used for authentication. If the private key is ever compromised, you should click the "Delete" button next to the public key on the GitHub "SSH and GPG keys" page and make/use a new key instead.

## Testing the Private Key for GitHub Authentication

Later in the setup process, you have to clone the repository in a specific way that requires authentication with GitHub. The steps here can provide that authentication, but you can also try using HTTPS authentication (following the login prompts) for that if your host/shell doesn't work, and so these steps are optional but useful for making sure that you did the key setup properly.

1. Make sure that you are working in a `bash` or `bash`-like shell that uses OpenSSH-compliant tooling and the SSH agent. You'll know if your shell isn't compatible if one of the commands later fails. Note that Command Prompt and PowerShell are known not to support this, so you should use [Git Bash](https://git-scm.com/downloads/win) instead if you are on Windows.

2. Ensure that the SSH agent is running by running the following command to start it if it isn't already running. You will know that it is running if a PID is shown.

```bash
eval `ssh-agent -s`
```

3. Run the following command, replacing `KEY_PATH` with the path to your private key.

```bash
ssh-add KEY_PATH
```

4. At this point, further SSH authentication attempts in the current shell session will be able to use the private key. You can now test whether the authentication for the project repository is successful with the following command in that same shell session:

```bash
ssh -T git@github.com
```

If you encounter a message that ends with `You've successfully authenticated, but GitHub does not provide shell access.`, your authentication setup was successful! Performing the clone command later in the project setup in an authenticated shell session like this should not give you a `Permission denied` error.
