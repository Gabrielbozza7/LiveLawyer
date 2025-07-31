# Registering for External Services

The services in this project depend on external services for their functionality. You should register for them to gain access to the credentials needed to work with them.

## Part 1: Expo

[Create an Expo account](https://expo.dev/signup). Then, let the organization manager know the username with which you signed up so that you can be added to the organization. Some CLI-based operations from your development environment will need to use your credentials (specifically: username and password).

We use Expo for EAS, which lets us create app builds remotely with minimal configuration on our end.

## Part 2: Twilio

[Create a Twilio account](https://www.twilio.com/login). Then, let the organization manager know the email with which you signed up so that you can be added to the organization.

We use Twilio for their video call and text messaging services, which are core components of the app's functionality.

## Part 3: Supabase

[Sign up for Supabase](https://supabase.com/dashboard/sign-up) using your GitHub account. Then, let the repository owner know that you have signed up so that you can be added to the Supabase project.

Supabase is the backend-as-a-service solution that we are using. Important aspects of it include the PostgreSQL database, Firebase-style authentication, and S3-compliant storage. Examples of what we store include user details, user authentication information, law offices, emergency contacts, call recordings, and call metadata.

## Part 4: ngrok

[Sign up for ngrok](https://dashboard.ngrok.com/signup) using your GitHub account.

ngrok provides a reverse proxy that allows for local development with HTTPS under a recognized TLS certificate (which happens to be required for using React Native with HTTPS without extensive configuration).
