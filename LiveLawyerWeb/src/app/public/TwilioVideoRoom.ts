import { connect, Room, LocalParticipant, RemoteParticipant, LocalVideoTrack, LocalAudioTrack, Participant } from 'twilio-video'

type mediaTrack = LocalAudioTrack | LocalVideoTrack;

const handleConnectedParticipant = (participant: LocalParticipant | RemoteParticipant,containerRef:HTMLDivElement) => {
  //div created
  const participantDiv = document.createElement('div')
  participantDiv.setAttribute("id",participant.identity)
  containerRef.appendChild(participantDiv)

  // iterate through the participant's published tracks and
  // call `handleTrackPublication` on them
  participant.tracks.forEach(trackpublication=>{
    console.log("trackPublication", trackpublication)
    handleTrackPublication(trackpublication, participant);
  })

  participant.on("trackPublished", handleTrackPublication);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleTrackPublication = (trackPublication:any,participant: LocalParticipant | RemoteParticipant) => {
  console.log("-----------------------\nIDENTITY: ",participant.identity)

  function displayTrack(track:mediaTrack){
    const participantDiv = document.getElementById(participant.identity);
    if (track != null && track != undefined) {
      participantDiv?.appendChild(track.attach())
    }
  }
  // check if the trackPublication contains a `track` attribute. If it does,
  // we are subscribed to this track. If not, we are not subscribed.
  if(trackPublication.track){
    displayTrack(trackPublication.track)
    
    
  }
  // listen for any new subscriptions to this track publication
  trackPublication.on("subscribed", displayTrack);
}

const handleDisconnectedParticipant = (participant: LocalParticipant | RemoteParticipant) => {
  participant.removeAllListeners();

  const participantDiv = document.getElementById(participant.identity);
  participantDiv?.remove()
}


export default class TwilioVideoRoom {
    private token: string;
    private room: Room | undefined;
    private allParticipants: Participant[];
    private callback: ((updatedParticipants: Participant[]) => void) | undefined;
    public x = handleConnectedParticipant;
    public y = handleDisconnectedParticipant;
    
    constructor() {
      this.token = "";
      this.room = undefined;
      this.allParticipants = [];
      this.callback = undefined;
    }

    public async joinRoom(roomName: string): Promise<boolean> {
      try {
        const response = await fetch("http://localhost:4000/join-room", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({roomName: roomName}),
          mode: 'cors'
        });
        const { token: retrievedToken } = await response.json();
        this.token = retrievedToken;
      } catch (error: unknown) {
        console.log(`POST error: ${(error as Error).message}`)
        return false;
      }
      try {
        this.room = await connect(this.token, {
          name: roomName,
        });
      } catch (error: unknown) {
        console.log(`Able to get token, but could not join room: ${(error as Error).message}`);
        return false;
      }
      return true;
    }

    public async disconnect() {
      if (this.room === undefined) {
        console.log("Cannot leave a room that hasn't been joined!");
        return;
      } else {
        console.log("Leaving room...");
        this.room.disconnect();
      }
    }

    public setupListeners(/*containerRef: HTMLDivElement,*/ callback: (updatedParticipants: Participant[]) => void) {
      if (this.room === undefined) {
        console.log("Cannot setup listeners if a room hasn't been joined!");
        return;
      }
      // // render the local and remote participants' video and audio tracks
      // handleConnectedParticipant(this.room.localParticipant,containerRef);
      // this.room.participants.forEach((participant) => {
      //   handleConnectedParticipant(participant,containerRef)
      // });
      // this.room.on("participantConnected", (participant) => {
      //   handleConnectedParticipant(participant,containerRef)
      // });

      // //disconnect issues
      // this.room.on("participantDisconnected", handleDisconnectedParticipant)
      // window.addEventListener("pagehide", () => this.room!.disconnect());
      // window.addEventListener("beforeunload", () => this.room!.disconnect());
      this.callback = callback;

      this.allParticipants = [this.room.localParticipant];
      this.room.participants.forEach(participant => {
        this.allParticipants.push(participant);
      });
      this.room.on("participantConnected", participant => {
        console.log("CCC");
        this.allParticipants.push(participant);
        callback([...this.allParticipants]);
      });
      // this.room.on("participantDisconnected", participant => {
      //   console.log("BBB");
      //   this.allParticipants.splice(this.allParticipants.findIndex(value => value == participant), 1);
      //   callback([...this.allParticipants]);
      // });
      window.addEventListener("pagehide", () => this.room!.disconnect());
      window.addEventListener("beforeunload", () => this.room!.disconnect());
      console.log("AAA");
      callback([...this.allParticipants]);
    }

    public receiveDisconnection(participant: Participant) {
      console.log("AHA PART 2");
      if (this.callback === undefined) {
        console.log("Callback undefined!");
        return;
      }
      console.log("BBB");
      this.allParticipants.splice(this.allParticipants.findIndex(value => value == participant), 1);
      this.callback([...this.allParticipants]);
    }
}
