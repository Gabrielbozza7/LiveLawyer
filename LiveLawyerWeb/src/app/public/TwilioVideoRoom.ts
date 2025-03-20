import { connect, Room, Participant } from 'twilio-video'

export default class TwilioVideoRoom {
    private token: string;
    private room: Room | undefined;
    private allParticipants: Participant[];
    private callback: ((updatedParticipants: Participant[]) => void) | undefined;
    
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

    public get inARoom(): boolean {
      return this.room !== undefined;
    }

    public async disconnect() {
      if (this.room === undefined) {
        console.log("Cannot leave a room that hasn't been joined!");
        return;
      } else {
        console.log("Leaving room...");
        this.room.disconnect();
        this.room = undefined;
      }
    }

    public setupListeners(callback: (updatedParticipants: Participant[]) => void) {
      if (this.room === undefined) {
        throw new Error("Cannot setup listeners if a room hasn't been joined!");
      }
      this.callback = callback;

      this.allParticipants = [this.room.localParticipant];
      this.room.participants.forEach(participant => {
        this.allParticipants.push(participant);
      });
      this.room.on("participantConnected", participant => {
        this.allParticipants.push(participant);
        callback([...this.allParticipants]);
      });
      window.addEventListener("pagehide", () => this.disconnect());
      window.addEventListener("beforeunload", () => this.disconnect());
      callback([...this.allParticipants]);
    }

    public receiveDisconnection(participant: Participant) {
      if (this.callback === undefined) {
        throw new Error("Callback undefined!");
      }
      this.allParticipants.splice(this.allParticipants.findIndex(value => value == participant), 1);
      this.callback([...this.allParticipants]);
    }
}
