# Twilio Information

The repository makes uses of Twilio for its video call functionality. This document will explain how to retrieve the Twilio credentials you need for the video calls to work and how to set your environment up with those credentials.

## Obtaining Credentials

This section explains how to get the credentials for the environment variables if credentials have not been provided to you.

1. [Create a Twilio account](https://www.twilio.com/login) if you don't already have one for use with this project.
2. After signing in, you should be redirected to the Account Dashboard. On this page in the bottom left box, take note of the values for "Account SID" and "Auth Token".
3. At the bottom of that some box, click "Go to API Keys". If you don't have an API key for use with this project, click the "Create API key" button and create a new key with type "Standard". Take note of the SID and secret of the key. Note that you can't see the secret again once you leave this menu, so if you lose it, you have to make a new key.

## Entering the Backend Environment Variables

This section explains how you should add Twilio credentials to the backend `.env` file, which is located at `LiveLawyerBackend/.env` relative to the root of the repository.

1. Set the value of `TWILIO_ACCOUNT_SID` to the value you saw for "Account SID" in step 2 of the previous section.
2. Set the value of `TWILIO_AUTH_TOKEN` to the value you saw for "Auth Token" in step 2 of the previous section.
3. Set the value of `TWILIO_API_KEY_SID` to the value you saw for the API key's SID in step 3 of the previous section.
4. Set the value of `TWILIO_API_KEY_SECRET` to the value you saw for the API key's secret in step 3 of the previous section.

An example of these variables in the file is as follows (note that there should be other variables too from other non-Twilio setup steps by the time you are done setting everything up):

```env
TWILIO_ACCOUNT_SID=abc123
TWILIO_AUTH_TOKEN=abc123
TWILIO_API_KEY_SID=abc123
TWILIO_API_KEY_SECRET=abc123
```
