import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import VolumeDown from '@mui/icons-material/VolumeDown'
import VolumeUp from '@mui/icons-material/VolumeUp'
import { useEffect, useRef, useState } from 'react'
import { AudioTrack, Track, VideoTrack } from 'twilio-video'
import Box from '@mui/material/Box'

interface TwilioTrackProps {
  track: Track
  participantCount: number
  aspectRatio: number
  isSelf: boolean
  isClient: boolean
}

export default function TwilioTrack({
  track,
  participantCount,
  aspectRatio,
  isSelf,
  isClient,
}: TwilioTrackProps) {
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
      <Box
        sx={{
          display: trackType === 'video' ? 'flex' : 'none',
          width: '100%',
          aspectRatio: isClient ? aspectRatio : aspectRatio * Math.max(1, participantCount - 1),
          overflow: 'hidden',
          borderRadius: 10,
        }}
      >
        <video
          ref={videoRef}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
      </Box>
      <Box sx={{ display: trackType === 'audio' ? 'flex' : 'none' }}>
        <audio ref={audioRef} />
        <Stack
          spacing={3}
          display="flex"
          flex={1}
          direction="column"
          alignItems={'center'}
          visibility={isSelf ? 'hidden' : 'visible'}
        >
          <VolumeUp />
          <Slider
            value={volume}
            onChange={handleChangeVolume}
            orientation="vertical"
            sx={{ flex: 1 }}
          />
          <VolumeDown />
        </Stack>
      </Box>
    </>
  )
}
