import { useEffect, useRef, useState } from "react";
import { Participant } from "twilio-video";
import { MediaTrack } from "twilio-video/tsdef/MediaTrack";
import TwilioTrack from "./TwilioTrack";
import TwilioVideoRoom from "./TwilioVideoRoom";

interface TwilioVideoParticipantProps {
    participant: Participant,
    room: TwilioVideoRoom,
}

// This component should be mounted when the participant joins and dismounted when the participant leaves.
export default function TwilioVideoParticipant({ participant, room }: TwilioVideoParticipantProps) {
    const participantDiv = useRef<HTMLDivElement>(null);
    const [tracks] = useState<MediaTrack[]>([]);
    const [trackUpdateFlag, setTrackUpdateFlag] = useState<number[]>([]);
    const [renderTracks, setRenderTracks] = useState<MediaTrack[]>([]);

    useEffect(() => {

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleTrackPublication = (trackPublication: any) => {
        console.log(`Called handleTrackPublication! ${participant.identity}`);
        const div: HTMLDivElement = participantDiv.current!;
      
        function displayTrack(track: MediaTrack){
          console.log(`Called displayTrack! ${participant.identity}`);
          if (track != null && track != undefined) {
            // div.appendChild(track.attach());
            // const newTrack = `Track (${track.kind}) for ${participant.identity}`;
            // setTracks([...tracks, newTrack]);
            if (tracks.findIndex(t => track == t) === -1) {
              tracks.push(track);
              setTrackUpdateFlag([0]);
              console.log(track);
              console.log(`New length of tracks: ${tracks.length}`);
            }
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

        participant.on("disconnected", par => {
          console.log("AHA PART 1");
          room.receiveDisconnection(par);
        });
      };

      const handleDisconnectedParticipant = () => {
        console.log(`Called handleDisconnectedParticipant! ${participant.identity}`);
        participant.removeAllListeners();
        tracks.splice(0, tracks.length);
        setTrackUpdateFlag([0]);
        // const div: HTMLDivElement = participantDiv.current!;
        // if (div) {
        //   if (div.children) {
        //     for (const child of div.children) {
        //       div.removeChild(child);
        //     }
        //   }
        // }
      };

      
      console.log(`Video participant mounting! ${participant.identity}`);
      handleConnectedParticipant();
      return () => {
        console.log(`Video participant DISmounting! ${participant.identity}`);
        handleDisconnectedParticipant();
      };
    }, []);

    useEffect(() => {
      console.log("Updating rendered tracks!");
      setRenderTracks([...tracks]);
    }, [trackUpdateFlag]);

    return (
      <div ref={participantDiv} style={{borderStyle: 'solid', borderColor: 'blue', margin: 5}}>
        {renderTracks.map(track => <TwilioTrack key={track.kind} track={track} />)}
      </div>
    );
}
