import { useEffect, useRef, useState } from 'react'
import { AudioTrack, Track, VideoTrack } from 'twilio-video'

interface WvTrackProps {
  track: Track
  log: (msg: string) => void
}

export default function WvTrack({ track, log }: WvTrackProps) {
  const [trackType, setTrackType] = useState<'video' | 'audio' | undefined>(undefined)

  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (track === null) {
      console.log('Null track!')
    } else if (videoRef.current !== null && track.kind === 'video') {
      setTrackType('video')
      try {
        const video = (track as VideoTrack).attach(videoRef.current)
        return () => {
          ;(track as VideoTrack).detach(video)
        }
      } catch (e) {
        log(`Video track attach error: ${(e as Error).message}`)
      }
    } else if (audioRef.current !== null && track.kind === 'audio') {
      setTrackType('audio')
      try {
        const audio = (track as AudioTrack).attach(audioRef.current)
        return () => {
          ;(track as AudioTrack).detach(audio)
        }
      } catch (e) {
        log(`Audio track attach error: ${(e as Error).message}`)
      }
    } else {
      console.log(`Unsupported track type: ${track.kind}`)
    }
  }, [log, track])
  return (
    <>
      <div
        hidden={trackType !== 'video'}
        style={{
          width: 320,
          height: 520,
          overflow: 'hidden',
          position: 'relative',
          margin: 5,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            height: '100%',
          }}
        >
          <video ref={videoRef} />
        </div>
      </div>
      <div hidden={trackType !== 'audio'}>
        <audio ref={audioRef} />
      </div>
    </>
  )
}
