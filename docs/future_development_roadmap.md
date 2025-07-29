# Future Development Roadmap

Tasks discussed here ideally should be completed before the service goes into production.

## Critical

### Scalability

Despite a major factor in deciding to use Supabase and Twilio being scalability, the backend server is currently monolithic in architecture and therefore becomes buggy when Heroku performs serverless/stateless scaling operations on it. The web-accessible parts of the project should definitely be fully refactored as microservices for production deployment, but it's not needed for handing the service out to testers and investors if known buggy behavior is acceptable since Heroku dynos are able to self-heal even if that causes temporary issues.

### Serverless Queues

The queues for observers and lawyers are currently held on the backend server. This means that for the logic to work successfully in the deployed Heroku dynos, the participants of some particular call must be connected to the same dyno and must not stay in the call long enough to trigger Heroku's serverless/stateless scaling operations that can corrupt the queue. Resolving this would involve using a message broker or a similar solution that works in scalable serverless architectures that handles the queues outside of the servers that handle the rest of the call logic.

### Supabase Security

There is one table in the database that is currently unprotected by RLS, and the storage buckets are currently accessible by any logged-in user. The security policies for these should definitely be changed.

### Call Reconnection Logic

The logic for reconnecting a call in the event of a network disconnection is known to be unstable and hasn't even been properly tested, and there is also no way to rejoin a call if the app or website is closed completely. Ideally, there should be a way to reconnect after a full exit out of the website/app in case something goes wrong, which would be much easier to test than automatic reconnects in the event of just a network failure. Also, it might be preferable to have a way for a participant to explicitly disconenct from a call in order to rejoin later.

### Automated Testing

As part of the Capstone team, we originally planned to write automated tests, but that never ended up happening. Having these is critical for putting the service into production, but it wouldn't hurt to have some basic sanity-checking automated tests before starting the test runs on a bigger scale.

### Database Schema Migrations and/or Versioning

Whenever a change in the database schema has been necessitated, the change has historically been made immediately to the one version of the database that we have. This is not something that can be done after people are already using the service because sudden changes like that can break live functionality if the website/app aren't also updated at the exact same time to accomodate that. The solution here is to have a schema migration system (noting that Supabase has support for database branching and that Prisma can handle schema migrations) and schedule periods of maintenance for performing all of the necessary changes in the shortest amount of time to keep the service down for as little as possible, which ideally will involve a CD pipeline. It also wouldn't hurt to have the database available locally for developement purposes since that wouldn't involve cloud operations that cost money.

### Email Address Verification

Users can currently sign up using any email address they want so long as the address reflects the valid format of a real address. This means that a user doesn't have to own the address to be able to sign up using it, and the address doesn't have to really exist in the first place. It is known that forcing email address verification during the signup process generally impacts the user experience in a negative way by increasing "friction", but this should at the very least be required for sensitive operations like buying subscriptions to use the service.

## Nice-to-Have

### Role-Based Access Control and Server-Side Rendering

It was suggested that clients should only be able to log into the app and that observers/lawyers should only be able to log into the website. Due to how password resets without being logged in are handled, there currently must be a way for everyone to log into the website, but this can be restricted just for this functionality if desired. There is currently nothing stopping clients from logging into the website or observers/lawyers from logging into the app. The user type-specific validation currently does prevent users from being able to do things that they shouldn't be able to do (such as a lawyer calling an observer or a client creating a law office), but access to the menus and pages isn't restricted. Currently, all of the code in the Webpack that Next.js compiles can be accessed by anyone connected to the website regardless of authentication status. It is possible to leverage server-side rendering from Next.js to restrict access to code for pages that are designated only to be accessible by certain users, which can help to control access to what is essentially proprietary software. Committing to this system would make migrating to another framework other than Next.js more difficult, but it is an open source solution that we are able to self-host (meaning that vendor lock-in isn't really a problem here). The app cannot have this kind of protection due to all of the code being present in the app itself, but that is acceptable because in the future, anyone should be able to register as a client anyway.

### Approval Processes

There is no system for approving accounts or approving access to call recordings. Anyone is able to sign up for any account type, and any participant of a call can download all of the recordings associated with that call. Also, law offices can be freely created by any lawyer. There was an idea that there should be another user type for dealing with administrative tasks relating to approval, and I think that this is the best route. Implementation for this would involve a separate notification system or a way to view all pending approval requests.

### Emergency Contacts Joining Calls

It was suggested that emergency contacts, upon being pinged by the alert system, should be able to join clients in their calls for legal counsel. This feature has not been implemented.

### Extended Law Office Functionality

It was suggested that law offices should be able to display custom logos and should have to go through an approval process with a system of providing documentation. These features have not been implemented.

### Recording Format

Currently, lawyers can download the individual tracks that were recorded as part of the calls in which they have participated. These tracks are disconnected from each other in this format, and it's not feasible for someone without the technical skills to stitch the recordings together to watch the call back as though it was happening again. Having a way to watch the call recordings as the call happened would likely make the recordings more useful.

### Full Voice Activation

Even though the app can be opened with voice activation from the operating system, a call cannot be started unless the client presses the button to start one. It might be a good idea to incorporate voice activitation within the app to start a call or to have a timeout that automatically starts a call if the app hasn't been touched after a set amount of time after being opened.

### Twilio Status Callbacks

Recordings are currently identified 5 seconds after a call is ended by a user, and the timestamps for connections to a call are based on backend socket timings instead of Twilio timings. These practices can be improved by using what Twilio refers to as "status callbacks", which would involve the Twilio API pinging a REST endpoint on our backend server to notify us of events such as recordings becoming available and participants joining calls. This could also help improve the possible events to be recorded in the call history logs.

### Replacement of Android WebView

As a temporary solution to get video calls working on Android for testing, a WebView is used to operate the media-specific logic. This has negative impacts on performance because it involves running a web browser to render the videos instead of using the system's native capabilities. This would ideally be replaced by one of the following solutions:

1. Somehow getting the library we are using for iOS to work on Android (having unknown implementation difficulty, potentially not possible, lowering the total amount of code)
2. Writing custom client-side Twilio handlers (requiring a lot of research, known to be possible, increasing the total amount of code)
3. Using a different cloud-based video call service that has official (as opposed to community-dependent) React Native support (requiring much of the video call code to be rewritten)
4. Creating a custom WebRTC solution (known to be possible, requiring extensive research and development, but also eliminating vendor lock-in)

### Capstone-Suggested App Improvements

The "Unfinished Business" document contains some suggestions for what could be improved later in the project. Most of it has been completed by now, but making embedded images into SVGs and adding profile picture customization are the only two tasks from that document which have not been completed, been replaced by an alternative solution, or already been suggested elsewhere in this document.
