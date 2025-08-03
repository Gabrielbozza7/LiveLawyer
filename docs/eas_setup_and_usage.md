# EAS Setup and Usage

Expo Application Services is a set of tools that we use for building and deploying the app. It is needed for using native code modules within the Expo ecosystem. The Expo Development Client allows the development server to watch for file changes and causes a hot reload (a "Fast Refresh") of the bundle code if any of the project's TypeScript code changes. This is convenient for fast development cycles, however, if the project's native code module dependencies change, a new build must be created for those dependencies to work.

Note that we do not currently have documentation for working with iOS simulators or physical Android devices.

This document has been written with the intention that the sections may be read in any order as needed with required previous sections being explicitly mentioned.

## Authenticating with EAS

This is a prerequisite to initiating cloud builds on EAS.

1. Prepare your Expo credentials. From within the dev container, run `expo login`. Enter the credentials for your Expo account as prompted. You can verify that you are logged in with `expo whoami`. You will have to repeat the login process if the container is rebuilt.
2. Ensure that the working tree for Git is clean by either committing your changes or stashing them (or, of course, not doing anything if it's already clean). EAS will refuse to start a build if there are uncommitted changes.

## Setting Up an Android Emulator from Android Studio

1. [Download and install Android Studio](https://developer.android.com/studio) on your host if you don't already have it. You may have to perform additional setup, but the development-related configurations don't really matter since the IDE is only being used here to run an Android emulator.
2. Open a blank project if you are not in the main workspace (which should have columns of icon buttons on the left and right sides of the window).
3. Click on the "Device Manager" icon, which is located by default in the column on the right side of the window.
4. In the view that opens, at the top, click the plus icon that has the "Add a new device" tooltip, then click "Create Virtual Device" in the context menu that appears.
5. Customize the device configuration as you wish. Note that if you want to take advantage of hardware acceleration, take note that you will have to create a custom hardware profile for images/devices that don't support it by default (especially ones with Google Play support). The option to enable hardware acceleration is on the "Verify Configuration" screen under "Emulated Performance".
6. After creating the device, it will show up in the list under that plus icon button clicked in step 4. Press the play icon button to start the emulator.

## Creating and Installing a Build on an Android Emulator

1. Ensure the following:
    - That you are in the directory for the app (`LiveLawyerApp` relative to the root of the repository)
    - That you are authenticated with EAS from the CLI (details: [Authenticating with EAS](#authenticating-with-eas))
2. Run `eas build --profile development --platform android`. We use `eas build` at the development level in order to use native modules not supported by Expo Go. Such modules include and are not limited to TwilioVideo so we do not reccommend attempting to modify this part of the process.
3. As the build is running, if you haven't already, download and install [Expo Orbit](https://expo.dev/orbit) on your host. After opening it, in "Settings...", sign in to your Expo account and ensure that Android is enabled under "Platforms".
4. In the main Expo Orbit menu, click on the new emulator that you just created under "Android" to select it if it is not already selected. If selected, the icon background next to the name becomes blue.
5. After the build finishes, in the main Expo Orbit menu, under "Projects", click "LiveLawyerApp". Login to the website if prompted, and then select the latest Android build (which should be the one that just finished).
6. Next to the blue "Install" button, click the "Open with Orbit" button. Expo Orbit will then install the build of the app on the emulator.

## Registering a Physical iOS Device to Work with Development Builds

Apple requires specific iOS devices to be explicitly targeted during the build process before they are able to run development builds.

1. Ensure that you are authenticated with EAS from the CLI. See [Authenticating with EAS](#authenticating-with-eas) for details.
2. Run `eas device:create`.
3. Select the `Generate a URL to be opened on the device you want to register.` option.
4. Scan the QR code with the iOS device you want to register and follow the setup.

## Creating and Installing a Build on a Physical iOS Device

1. Ensure the following:
    - That you are in the directory for the app (`LiveLawyerApp` relative to the root of the repository)
    - That you are authenticated with EAS from the CLI (details: [Authenticating with EAS](#authenticating-with-eas))
    - That your device has been registered properly (details: [Registering a Physical iOS Device to Work with Development Builds](#registering-a-physical-ios-device-to-work-with-development-builds))
2. Run `eas build --profile development --platform ios`
3. You might be prompted to login to an Apple Developer account and to select the build's device targets if this is your first build or if the container has been rebuilt.
    - The credentials for logging into the Apple Developer account are the same as the actual Apple account's credentials.
    - If prompted to select the device targets, use the arrow keys to highlight yours, then press the space bar to select it. Press Enter to confirm the selection. If prompted, select `Website - Generates a registration URL to be opened on your devices.`. Then, follow the instructions on `expo.dev` to download and install the provisioning profile.
4. As the build is running, if you haven't already, make sure that Developer Mode is enabled in the settings for your device. The setting appears to be located in different spots depending on the device and version of iOS. Note that you do not need an Apple Developer account in order to do this.
5. When the build finishes, you should see a download link and a QR code. You can scan the QR code to install the build.
    - If you don't see a QR code or are looking to use a build not immediately after its creation, visit the [project dashboard](https://expo.dev/accounts/gabetheman/projects/LiveLawyerApp) and select the latest build. Then, click the blue "Install" button and scan the shown QR code with your device, following the setup to download and install the app.
6. If you haven't done so already, trust the Developer Profile on your device in Settings → General → VPN & Device Management.

## Running the App

In order to do this, you must have a development build installed on your device. Refer to one of the above build-related sections to obtain a development build if you don't have one already.

After a development build of the app has been installed on your device (iOS or Android), you can open it, but it won't do anything unless it's connected to a development server.

1. To start the local development server, run `run app`. If the development server says that it is using Expo Go, press `s` to switch to using the development build.
2. You will then be presented a QR code and a line of text under it saying something like `Metro waiting on exp+livelawyerapp://expo-development-client/?url=somethingSomething`. You can scan the QR code or enter the displayed URL into the app so that the device becomes configured to connect to it.
3. The device should automatically connect to the development server to download and use the bundle with hot reload functionality, ready for interactive testing. In the future, if you start the development server and then start the app without the server IP changing, the device should automatically reconnect without needing to scan the QR code or enter the URL.
