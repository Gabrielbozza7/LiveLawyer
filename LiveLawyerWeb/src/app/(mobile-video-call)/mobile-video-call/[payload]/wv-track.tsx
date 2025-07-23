import { CSSProperties, useEffect, useRef, useState } from 'react'
import { AudioTrack, Track, VideoTrack } from 'twilio-video'

interface WvTrackProps {
  track: Track
  style?: CSSProperties
}

export default function WvTrack({ track, style }: WvTrackProps) {
  const [trackType, setTrackType] = useState<'video' | 'audio' | undefined>(undefined)

  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (track === null) {
      console.log('Null track!')
    } else if (videoRef.current !== null && track.kind === 'video') {
      setTrackType('video')
      const video = (track as VideoTrack).attach(videoRef.current)
      return () => {
        ;(track as VideoTrack).detach(video)
      }
    } else if (audioRef.current !== null && track.kind === 'audio') {
      setTrackType('audio')
      const audio = (track as AudioTrack).attach(audioRef.current)
      return () => {
        ;(track as AudioTrack).detach(audio)
      }
    } else {
      console.log(`Unsupported track type: ${track.kind}`)
    }
  }, [track])
  return (
    <>
      <video ref={videoRef} hidden={trackType !== 'video'} style={style} />
      <audio ref={audioRef} hidden={trackType !== 'audio'} />
    </>
  )
}
