import Box from '@mui/material/Box'
import { CSSProperties, useEffect, useRef, useState } from 'react'
import { AudioTrack, Track, VideoTrack } from 'twilio-video'

interface WvTrackProps {
  track: Track
  participantCount: number
  aspectRatio: number
  isClient: boolean
  style?: CSSProperties
}

export default function WvTrack({
  track,
  participantCount,
  aspectRatio,
  isClient,
  style,
}: WvTrackProps) {
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
      <Box
        sx={{
          display: trackType === 'video' ? 'flex' : 'none',
          width: '100%',
          aspectRatio: isClient ? aspectRatio : aspectRatio * Math.max(1, participantCount - 1),
          overflow: 'hidden',
        }}
      >
        <video
          ref={videoRef}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            ...style,
          }}
        />
      </Box>
      <Box sx={{ display: trackType === 'audio' ? 'flex' : 'none' }}>
        <audio ref={audioRef} />
      </Box>
    </>
  )
}
