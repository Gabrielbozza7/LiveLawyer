import { useEffect, useRef, useState } from 'react'
import { Participant, Track } from 'twilio-video'
import TwilioVideoRoom from '../classes/TwilioVideoRoom'
import { twilioIdentityToInfo } from 'livelawyerlibrary'
import { MediaTrack } from 'twilio-video/tsdef/MediaTrack'
import TwilioTrack from './TwilioTrack'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'

interface TwilioVideoParticipantProps {
  participant: Participant
  room: TwilioVideoRoom
}

// This component should be mounted when the participant joins and dismounted when the participant leaves.
export default function TwilioParticipant({ participant, room }: TwilioVideoParticipantProps) {
  const initializedRef = useRef<boolean>(false)
  const [tracks, setTracks] = useState<MediaTrack[]>([])

  useEffect(() => {
    if (initializedRef.current === false) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleTrackPublication = (trackPublication: any) => {
        function displayTrack(track: Track) {
          if (track != null && track != undefined) {
            if (track.kind === 'video' || track.kind === 'audio') {
              if (tracks.findIndex(t => track == t) === -1) {
                setTracks(t =>
                  [...t, track as MediaTrack].sort((a, b) => {
                    if (a.kind === 'video' && b.kind === 'audio') return -1
                    if (a.kind === 'audio' && b.kind === 'video') return 1
                    return 0
                  }),
                )
              }
            } else {
              console.log(`Unsupported track type: ${track.kind}`)
            }
          }
        }
        // check if the trackPublication contains a `track` attribute. If it does,
        // we are subscribed to this track. If not, we are not subscribed.
        if (trackPublication.track) {
          displayTrack(trackPublication.track)
        }
        // listen for any new subscriptions to this track publication
        trackPublication.on('subscribed', displayTrack)
      }

      const handleConnectedParticipant = () => {
        // iterate through the participant's published tracks and
        // call `handleTrackPublication` on them
        participant.tracks.forEach(trackPublication => {
          handleTrackPublication(trackPublication)
        })

        participant.on('trackPublished', handleTrackPublication)

        participant.on('disconnected', p => {
          room.receiveDisconnection(p)
        })
      }

      handleConnectedParticipant()
      initializedRef.current = true
      return () => {
        participant.removeAllListeners()
      }
    }
  }, [participant, room, tracks])

  return (
    <Paper sx={{ width: '80%', height: '80%' }}>
      <Stack spacing={2} alignItems="center" direction="column">
        <Typography style={{ fontWeight: 'bold', marginBottom: 5 }}>
          {twilioIdentityToInfo(participant.identity).userType}
        </Typography>

        {tracks.map((track, index) => (
          <TwilioTrack key={index} track={track} />
        ))}
      </Stack>
    </Paper>
  )
}
