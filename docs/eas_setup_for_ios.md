# EAS Setup for iOS

### Originally we were using Expo Go

*However, Expo Go doesn't support native dependencies like Twilio Video, so we switched to Expo EAS for cloud builds and native module support.*

## Step 1: 
### Install the latest Expo CLI if you haven’t already. 
*The -g just means you install it globally:*

`npm install -g expo`

## Step 2: 
### Install the EAS CLI, which allows you to use EAS build services:

`npm install -g eas-cli`

## Step 3: 
### Log in to Expo using the shared team Expo account by running:

`expo login`

### Step 3a: 
- Here it will wait for you to fill in the email and password for the Expo account. For this, we're using a temp account made for this. 
`Username`: *gabeTheMan*
`Password`: *blongopongo123*

### Step 3b: 
- You will then download the correct version of the project from the Expo account.
- Navigate to the directory where you want to store the correct version of the app and run:
*Only clone if you have not cloned the app yet*
`git clone https://github.com/Gabrielbozza7/LiveLawyer.git`
`cd LiveLawyer/LiveLawyerApp`

## Step 4: 
### Ensure your project is properly linked to the Expo account:

`expo whoami`

- If the output does not show the shared Expo account, log in again using:

`expo login`

## Step 5: 
### Install dependencies to ensure everything works:

`npm install`

## Step 6: 
### Configure the Project into an EAS project:

`eas init`

## Step 7: 
### Pull the latest updates from the Expo account 
- We do this to sync our local copy with the correct version:

`eas update --branch main`

### You are now working with the correct version of the app.

## Step 8: 
### Registering Your Mobile Device for Development Builds

- Apple requires each iPhone to be registered before running development builds. That's just how it is.
- Run the following command
`eas device:create`
- Select the provided option: 
*"Generate a URL to be opened on the device you want to register."*
- Scan the QR code with the iPhone you want to register. 
- The purpose of this is to allow your to be receptive of Testflight versions of the app one day when testing deployment.

## Step 9:
### Run the development build on your own Windows machine:

`eas build --profile development --platform ios`

*If this part results in an error, scroll down to Git Clone Error Issue*

## Step 10:
### Developer Mode on iPhone

- Go into your iPhone settings and find the section for Developer mode and turn it on.(You dont need to actually have a developer account for this nor do you need to login with my apple account for this. In the event that it does not appear initially, try looking again after you install the provisioning profile)

When prompted, choose:

``"Website - Generates a registration URL to be opened on your devices."``

## Step 11: 
### Scan the QR code with your iPhone.

- Follow the instructions on *expo.dev* to download and install the provisioning profile.
- The build process will continue automatically once registration is complete.
- When the build finishes, Expo will provide a download link.

## Step 12:
### Installing the Developer Build
- Install the Development Build on Your iPhone
- On your computer, go to [Expo’s build dashboard](https://expo.dev/accounts/gabeTheMan/projects/):

*A link in light grey should appear by the QR code with this link. It will likely be a little longer than this one and that's ok.

- Click on the latest development build.
- Click the blue "Install" button.
- Scan the QR code with your iPhone.
- Download and install the app.

Trust the Developer Profile on your iPhone by going to:
Settings → General → VPN & Device Management.

#### Find your Apple ID under Developer App and tap Trust [Your Apple ID].

## Step 13: 
### Running the App.

- After you install the app, you can open it to see it needs development server. run the command:

    `npx expo start --dev-client`

- This will allow the app we installed to ship the code in our expo project. You will then be presented a QR code and a line of text under it saying something to the effect of:

    *Metro waiting on exp+livelawyerapp://expo-development-client/?url=httpIpAddressHere*

- Copy everything after "waiting on" and paste that into a field within the app on your phone labeled "Enter URL Manually" so that your phone knows where to connect. 

## Step 14: 
### Running and Testing the Development Build

- Now that you have installed the development build, you can run the app and update it instantly.
- Use the new local Expo CLI by running:

`npx expo start --dev-client`

- This will generate a QR code.
- Scan it with your iPhone to open the app inside the Expo Dev Client.
- Now, every time you save changes, your app will automatically update.
- If `npx expo start --dev-client` fails, try the old command:
`expo start --dev-client`
- If you see an error about deprecated Expo CLI, uninstall the old version and reinstall it:
`npm uninstall -g expo-cli`
`npm install expo`

## Step 15: 
### Keeping the Code in Sync

- We are using Git to track and store different versions of the project as we add features.
- Each new feature or update will have a version label, for example:
`V.1 - Server Connected`
`V.2 - Call Feature`
- This allows us to roll back or track changes easily. You will be given instructions on pulling and pushing changes when necessary.
- Before making any changes, pull the latest updates from GitHub:
`git pull origin main`
- Start working on a feature by creating a new branch:
`git checkout -b feat/feature-name`
- Make changes and test using:
`npx expo start --dev-client`

#### Once the feature works, commit and push it:
`git add .`
`git commit -m "feat: Implemented Feature XYZ"`
`git push origin feat/feature-name`

Once you confirmed the feature to be stable, merge the branch into testing. This way, we can work our way piecemeal to the finished product.

- Push the updated app to Expo:
`eas update --branch main`

- All teammates pull the latest Expo update before continuing work:
`eas update --branch main`

## Git Clone Error Issue

After running

`eas build --profile development --platform ios`

*At the git clone error*

#### Do this:
Add `"requireCommit":true` in *eas.json*

Then try:
`git init`
`git add .`

Then run the given command since `git add` will fail

`git config --global --add safe.directory /workspaces/LiveLawyer/LiveLawyerApp`

Now `git add .` should work

Run this:
`git config --global user.email "you@example.com"`
`git config --global user.name "Your Name"`
`git commit -m "commit fix"`

Now this should work and the instructions should be the same afterwards:
`eas build --profile development --platform ios`

#### Note:
- Ensure this is done inside of the LiveLawyerApp directory.
- This will make a nested git repo inside of the main over arching repo but as long as you don't run any git commands inside of /LiveLawyerApp you should be fine.
- Always run git commands from the root project directory.
