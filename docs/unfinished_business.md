# Unfinished Business

### App Frontend To-Do
* Make all embedded images into SvGs to improve performance
* UI everywhere could use some touching up
* Profile Page UI could allow implementation for a profile picture (the db column to hold the picture is already set up)

### Web Frontend To-Do
* Port Auth workflow from app to web view
* Allow call history logic to show on observer side
    * Storage of call history should be setup already
* Web UI could also use some touching up


### Serverside To-Do
* Proper Row Level Security for `public` tables and `call-recordings` bucket. 
* Creating rows from backend for `CallMetadata`, `CallEvent`, and `CallRecording`.
* Implementing Supabase in `LiveLawyerWeb`
* Fix Prisma issue where it is not generating clients
* Setup Prisma Migrations
