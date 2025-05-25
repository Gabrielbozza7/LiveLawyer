# LiveLawyer

The source for the app can be found in `./LiveLawyerApp`, and Expo has generated its own README there to explain how to get started.

## WARNING FOR WINDOWS USERS!

When you clone the repository, make sure that the cloning process does not convert the repository's LF line endings to CRLF if you intend to work inside the dev container (because CRLF line endings will break everything!):

```powershell
git clone --config core.autocrlf=input git@github.com:Gabrielbozza7/LiveLawyer.git
```

## Initial Setup

When you are first setting up the repository to work with your computer, you should visit these guides in the following order:

1. [GitHub SSH Key Setup](./docs/github_ssh_key_setup.md)
2. [Dev Container Setup](./docs/dev_container_setup.md)
3. [Container Volume Setup](./docs/container_volume_setup.md)
4. [Expo EAS Setup Guide for IOS](./docs/eas_set_up.md)
5. [Twilio Information](./docs/twilio.md)
6. [Supabase/Backend Information](./docs/supabase_backend.md)

You might also want to take a look at [Guidelines](./docs/guidelines.md) and [Unfinished Business](./docs/unfinished_business.md), but those are not part of the initial setup process.
