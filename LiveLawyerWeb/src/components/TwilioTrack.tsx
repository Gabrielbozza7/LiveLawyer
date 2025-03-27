import { useEffect, useRef } from 'react'
import { Track } from 'twilio-video'
import { MediaTrack } from 'twilio-video/tsdef/MediaTrack'

interface TwilioTrackProps {
  track: Track
}

export default function TwilioTrack({ track }: TwilioTrackProps) {
  const divRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (track === null) {
      console.log('Null track!')
    } else if (divRef.current === null) {
      console.log('Null div!')
    } else if (track.kind === 'video' || track.kind === 'audio') {
      const child = (track as MediaTrack).attach()
      divRef.current!.appendChild(child)
      return () => {
        ;(track as MediaTrack).detach(child)
      }
    } else {
      console.log(`Unsupported track type: ${track.kind}`)
    }
  }, [track])
  return <div ref={divRef} />
}
