/**
 * File for connecting into the rooms
 */

import { connect, Room, LocalParticipant, RemoteParticipant, LocalVideoTrack, LocalAudioTrack } from 'twilio-video'
import React from "react";

type mediaTrack = LocalAudioTrack | LocalVideoTrack

export const startRoom = async (event: React.FormEvent<HTMLFormElement>,htmlForm:HTMLFormElement,containerRef:HTMLDivElement) => {
    // prevent a page reload when a user submits the form
    const formData = new FormData(htmlForm)
    const roomName = formData.get("room_name")!.toString()

    event.preventDefault();
    // hide the join form
    htmlForm.style.visibility = "hidden";
  
    // fetch an Access Token from the join-room route
    let token: string;
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
      token = retrievedToken;
    } catch (error: unknown) {
      console.log(`POST error: ${(error as Error).message}`)
      return;
    }

    const room = await joinVideoRoom(roomName, token);

    // render the local and remote participants' video and audio tracks
    handleConnectedParticipant(room.localParticipant,containerRef);
    room.participants.forEach((participant) => {
      handleConnectedParticipant(participant,containerRef)
    });
    room.on("participantConnected", (participant) => {
      handleConnectedParticipant(participant,containerRef)
    });

    //disconnect issues
    room.on("participantDisconnected", handleDisconnectedParticipant)
    window.addEventListener("pagehide", () => room.disconnect());
    window.addEventListener("beforeunload", () => room.disconnect());
  };


/**
 *  Can be in page.tsx because it only appends the people who join in the call
 */
const handleConnectedParticipant = (participant: LocalParticipant | RemoteParticipant,containerRef:HTMLDivElement) => {
    //div created
    const participantDiv = document.createElement('div')
    participantDiv.setAttribute("id",participant.identity)
    containerRef.appendChild(participantDiv)

    // iterate through the participant's published tracks and
  // call `handleTrackPublication` on them
    participant.tracks.forEach(trackpublication=>{
      console.log("trackPublication", trackpublication)
      handleTrackPublication(trackpublication,participant,containerRef);
    })

    participant.on("trackPublished", handleTrackPublication)
    
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleTrackPublication = (trackPublication:any,participant: LocalParticipant | RemoteParticipant,containerRef:HTMLDivElement) => {
  console.log("------------------")
  console.log("TrackPublication: ",trackPublication.track)

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
    // listen for any new subscriptions to this track publication
    trackPublication.on("subscribed", displayTrack);
  }

}

const joinVideoRoom = async (roomName:string, token:string): Promise<Room> => {
    // join the video room with the Access Token and the given room name
    const room = await connect(token, {
      name: roomName,
    });
    return room;
};
const handleDisconnectedParticipant = (participant: LocalParticipant | RemoteParticipant) => {
  participant.removeAllListeners();

  const participantDiv = document.getElementById(participant.identity);
  participantDiv?.remove()
}
