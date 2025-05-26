# VPN Setup

At times, the first team ran into problems with networking between the device hosting the backend server and the mobile device used for testing the app. A solution that often got around these problems was using a VPN, which had the added benefit of no longer needing to change the IP-related variables as the backend server device changed networks. This guide explains how to configure and use a ZeroTier network for use with this project, but using a ZeroTier network is (probably) not required on a LAN that freely allows discoverability and intranet connections to happen.

## Creating a Network

1. If you don't already have a ZeroTier account, [create one](https://my.zerotier.com/login), and if you do, log into it. Note that a free network can be created for use up to ten devices, so multiple developers can share a network if that is desireable. In that case, only one developer would have to create an account and network.

2. Go to the [networks page](https://my.zerotier.com/) and click the "Create A Network" button. The new network should appear in the list; click on it.

3. Under the "Settings" section, change the name of the network to something more related to the project (such as "Live Lawyer Network"). This name will show up on devices when selecting a network.

4. At the top of the page for the network, there is an ID with letters and numbers under the label "Network ID:". This is the network ID that will be referred to when adding devices to the network.

## Adding Devices to the Network

### Windows (with probably similar steps for macOS and Linux)

1. Go to the [Download](https://www.zerotier.com/download/) page. Download and install the client, making sure that you allow it to add virtual drivers if prompted.

2. Upon launching the client, look for its icon in the system tray on Windows (this is likely in a different spot for other systems). Click on that icon.

3. In the menu that pops up, click "Join New Network...". Enter the network ID and click "Join".

4. On the networks page on the account that created the network, click the "Refresh" button. The device's join request should pop up in the list; allow it. You should also add a name to the device to avoid confusion.

5. On the connecting device, click on the tray icon for ZeroTier and hover over the network ID. Another menu should pop up; hover over "Managed Addresses" in that menu. A third menu should pop up as a result containing the CIDR-ized IP address range for that device. You can use the main address in that range (the IP if you remove the "/" and the part after the "/") when supplying your IP address when following the instructions for later guides in the setup process.

The device will be connected to the VPN when a checkmark appears next to the network ID when the tray icon is clicked; to turn it on and off, hover over the network ID and click "Reconnect" or "Disconnect" respectively in the menu that pops up.

### iOS (with probably similar steps for Android)

1. Download the ZeroTier One app from the App Store or Google Play.

2. After opening the app, tap the "+" in the top right. Enter the network ID (or, instead, scan the QR code that is provided next to the network ID on the network page).

3. Toggle the "Enable Default Route" option to be on, and then tap "Add Network".

4. On the networks page on the account that created the network, click the "Refresh" button. The device's join request should pop up in the list; allow it. You should also add a name to the device to avoid confusion. The IP to use for the device is in the "Managed IPs" column of the list of connected devices.

The mobile device will be connected to the VPN when option next to the network ID is toggled to be on on the page that opens when the app is started.
