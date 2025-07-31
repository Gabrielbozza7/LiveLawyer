# Environment Variables Setup

This document will explain how to retrieve the credentials needed for the project's environment variables and how to configure the environment variable files for your development environment.

## Part 1: Backend Variables

The variables in this section should be entered into `LiveLawyerBackend/.env` relative to the root of the repository. If that file doesn't already exist (which is the likely case if you are going through the regular setup process), create it.

1. [Sign in to Twilio](https://www.twilio.com/login). After signing in, you should be redirected to the Account Dashboard. Using the contents of the bottom left box:
    - Set the value of the `TWILIO_ACCOUNT_SID` variable to the value listed for "Account SID".
    - Set the value of the `TWILIO_AUTH_TOKEN` variable to the value listed for "Auth Token".
    - Set the value of the `TWILIO_PHONE_NUMBER` variable to the value listed for "My Twilio phone number".
2. At the bottom of that same box, click "Go to API Keys". If you don't have an API key for use with this project, click the "Create API key" button and create a new key with type "Standard". Note that you can't see the key's secret again once you leave this menu, so if you lose it, you have to make a new key. Using the newly displayed values:
    - Set the value of the `TWILIO_API_KEY_SID` variable to the value listed for the key's SID.
    - Set the value of the `TWILIO_API_KEY_SECRET` variable to the value listed for the key's secret.
3. [Sign in to Supabase](https://supabase.com/dashboard/sign-in). Select the organization and project to navigate to the Supabase Dashboard for the project. On the left drawer, click "Project Settings". Under "Configuration" on the left, click "Data API".
    - Set the value of the `SUPABASE_URL` variable to the URL displayed next to "URL". This value will be needed again and will be referred to as "the Supabase URL".
4. On that same page, under "Project Settings" on the left, click "API Keys".
    - Set the value of the `SUPABASE_KEY` variable to the key displayed next to "`anon` `public`". This value will be needed again and will be referred to as "the Supabase anonymous key".
5. Ask the database owner for the credentials of the privileged backend user. This practice will hopefully be replaced by a working service role key in the future.
    - Set the value of the `DATABASE_USER` variable to the user's email address.
    - Set the value of the `DATABASE_PASSWORD` variable to the user's password.

To make sure that you didn't miss a step, check that your `LiveLawyerBackend/.env` file contains the the following key-value pairs (with different values though, of course):

```env
TWILIO_ACCOUNT_SID=abc123
TWILIO_AUTH_TOKEN=abc123
TWILIO_PHONE_NUMBER=abc123
TWILIO_API_KEY_SID=abc123
TWILIO_API_KEY_SECRET=abc123

SUPABASE_URL=https://abc.123/
SUPABASE_KEY=abc123
DATABASE_USER=xyz@abc.123
DATABASE_PASSWORD=abc123
```

## Part 2: Library and App Variables

The variables in this section should be entered into `LiveLawyerLibrary/.env` relative to the root of the repository. If that file doesn't already exist (which is the likely case if you are going through the regular setup process), create it.

1. If you haven't already claimed a static domain on ngrok, [claim one](https://dashboard.ngrok.com/domains).
    - Set the value of the `WEBSITE_URL` variable to that static domain, including the HTTPS protocol and a trailing slash.
2. Refer to the Supabase variables from Part 1.
    - Set the value of the `SUPABASE_URL` variable to the Supabase URL.
    - Set the value of the `SUPABASE_ANON_KEY` variable to the Supabase anonymous key.

To make sure that you didn't miss a step, check that your `LiveLawyerLibrary/.env` file contains the the following key-value pairs (with different values though, of course):

```env
WEBSITE_URL=https://abc123.ngrok-free.app/
SUPABASE_URL=https://abc.123/
SUPABASE_ANON_KEY=abc123
```

For compatibility reasons, the app currently has a separate `LiveLawyerApp/.env` file relative to the root of the repository whose values match the values of `LiveLawyerLibrary/.env`. If that file doesn't already exist (which is the likely case if you are going through the regular setup process), create it. Then, copy the contents from `LiveLawyerLibrary/.env` into it and append `EXPO_PUBLIC_` to the beginning of each key. The app's `.env` file should now have this structure:

```env
EXPO_PUBLIC_WEBSITE_URL=https://abc123.ngrok-free.app/
EXPO_PUBLIC_SUPABASE_URL=https://abc.123/
EXPO_PUBLIC_SUPABASE_ANON_KEY=abc123
```

These files should ideally be decoupled at some point.

## Part 3: Website Variable

The variable in this section should be entered into `LiveLawyerWeb/.env` relative to the root of the repository. If that file doesn't already exist (which is the likely case if you are going through the regular setup process), create it.

1. Set the value of the `REAL_BACKEND_URL` variable to a URL that accesses the backend server when running, including the HTTPS protocol and a trailing slash. For local development, the value provide below should be sufficient.

```env
REAL_BACKEND_URL=https://localhost:4000/
```
