import { useEffect, useRef } from "react";
import { Participant } from "twilio-video";
import { MediaTrack } from "twilio-video/tsdef/MediaTrack";

interface TwilioVideoParticipantProps {
    participant: Participant,
}

// This component should be mounted when the participant joins and dismounted when the participant leaves.
export default function TwilioVideoParticipant({ participant }: TwilioVideoParticipantProps) {
    const participantDiv = useRef<HTMLDivElement>(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleTrackPublication = (trackPublication: any) => {
      console.log(`Called handleTrackPublication! ${participant.identity}`);
      const div: HTMLDivElement = participantDiv.current!;
    
      function displayTrack(track: MediaTrack){
        console.log(`Called displayTrack! ${participant.identity}`);
        if (track != null && track != undefined) {
          div.appendChild(track.attach());
        }
      }
      // check if the trackPublication contains a `track` attribute. If it does,
      // we are subscribed to this track. If not, we are not subscribed.
      if(trackPublication.track){
        displayTrack(trackPublication.track)
      }
      // listen for any new subscriptions to this track publication
      trackPublication.on("subscribed", displayTrack);
    };

    const handleConnectedParticipant = () => {
      console.log(`Called handleConnectedParticipant! ${participant.identity}`);
      // div.setAttribute("id",participant.identity);

      // iterate through the participant's published tracks and
      // call `handleTrackPublication` on them
      participant.tracks.forEach(trackPublication => {
        console.log("trackPublication", trackPublication);
        handleTrackPublication(trackPublication);
      });
    
      participant.on("trackPublished", handleTrackPublication);
    };

    const handleDisconnectedParticipant = () => {
      console.log(`Called handleDisconnectedParticipant! ${participant.identity}`);
      participant.removeAllListeners();
      const div: HTMLDivElement = participantDiv.current!;
      if (div) {
        if (div.children) {
          for (const child of div.children) {
            div.removeChild(child);
          }
        }
      }
    };

    useEffect(() => {
      console.log(`Video participant mounting! ${participant.identity}`);
      handleConnectedParticipant();
      return () => {
        console.log(`Video participant DISmounting! ${participant.identity}`);
        handleDisconnectedParticipant();
      };
    });

    return <div ref={participantDiv} style={{borderStyle: 'solid', borderColor: 'blue', margin: 5}} />;
}
