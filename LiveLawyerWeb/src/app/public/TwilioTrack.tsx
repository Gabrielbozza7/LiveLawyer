import { useEffect, useRef } from "react";
import { MediaTrack } from "twilio-video/tsdef/MediaTrack";

interface TwilioTrackProps {
    track: MediaTrack
}

export default function TwilioTrack({ track }: TwilioTrackProps) {
  const divRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (track === null) {
      console.log("Null track!");
    } else if (divRef.current === null) {
      console.log("Null div!");
    } else {
      const child = track.attach();
      divRef.current!.appendChild(child);
      return () => {
        track.detach(child);
      }
    }
  }, [track]);
  return (
    <div ref={divRef} />
  );
}
