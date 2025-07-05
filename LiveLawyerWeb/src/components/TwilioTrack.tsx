import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import VolumeDown from '@mui/icons-material/VolumeDown'
import VolumeUp from '@mui/icons-material/VolumeUp'
import { useEffect, useRef, useState } from 'react'
import { AudioTrack, Track, VideoTrack } from 'twilio-video'

interface TwilioTrackProps {
  track: Track
}

export default function TwilioTrack({ track }: TwilioTrackProps) {
  const [trackType, setTrackType] = useState<'video' | 'audio' | undefined>(undefined)
  const [volume, setVolume] = useState<number>(50)

  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const handleChangeVolume = (event: Event, newVolume: number) => {
    setVolume(newVolume)
    if (audioRef.current !== null) {
      audioRef.current.volume = newVolume / 100.0
    }
  }

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
        <Stack spacing={2} direction="row" sx={{ alignItems: 'center', mb: 1 }}>
          <VolumeDown />
          <Slider value={volume} onChange={handleChangeVolume} sx={{ minWidth: 250 }} />
          <VolumeUp />
        </Stack>
      </div>
    </>
  )
}
