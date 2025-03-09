/**
 * File for connecting into the rooms
 */

import { connect, Room, LocalParticipant, RemoteParticipant, RemoteTrackPublication, LocalTrack, RemoteTrack, Participant,LocalVideoTrack,LocalAudioTrack, TrackPublication} from 'twilio-video'
import React,{useRef} from "react";
import { PageConfig } from 'next';
import App from '../page'

type mediaTrack = LocalAudioTrack | LocalVideoTrack

export const startRoom = async (event: React.FormEvent<HTMLFormElement>,htmlForm:HTMLFormElement,containerRef:HTMLDivElement) => {
    // prevent a page reload when a user submits the form
    const formData = new FormData(htmlForm)
    let roomName = formData.get("room-name-input")!.toString()

    event.preventDefault();
    // hide the join form
    htmlForm.style.visibility = "hidden";
  
    // fetch an Access Token from the join-room route
    const response = await fetch("/join-room", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({roomName}),
    });
    const { token } = await response.json();

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
    const participantDiv = document.createElement('div')
    participantDiv.setAttribute("id",participant.identity)
    containerRef.appendChild(participantDiv)

    // iterate through the participant's published tracks and
  // call `handleTrackPublication` on them
    participant.tracks.forEach(trackpublication=>{
      handleTrackPublication(trackpublication.track as mediaTrack,participant);
    })

    participant.on("trackPublished", handleTrackPublication)
    
}
const handleTrackPublication = (trackPublication:any,participant: LocalParticipant | RemoteParticipant) => {
  function displayTrack(track:mediaTrack){
    const participantDiv = document.getElementById(participant.identity);
    participantDiv?.append((track as mediaTrack).attach())
  }
  // check if the trackPublication contains a `track` attribute. If it does,
  // we are subscribed to this track. If not, we are not subscribed.
  if(trackPublication){
    displayTrack(trackPublication.track)
  }

  // listen for any new subscriptions to this track publication
  trackPublication.on("subscribed", displayTrack);
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
