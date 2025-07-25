import { CSSProperties, useEffect, useRef, useState } from 'react'
import { Participant, Track } from 'twilio-video'
import { MediaTrack } from 'twilio-video/tsdef/MediaTrack'
import TwilioVideoRoom from '@/classes/TwilioVideoRoom'
import WvTrack from './wv-track'

interface WvParticipantProps {
  participant: Participant
  room: TwilioVideoRoom
  participantCount: number
  aspectRatio: number
  isClient: boolean
  style?: CSSProperties
}

// This component should be mounted when the participant joins and dismounted when the participant leaves.
export default function WvParticipant({
  participant,
  room,
  participantCount,
  aspectRatio,
  isClient,
  style,
}: WvParticipantProps) {
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
    <>
      {tracks.map((track, index) => (
        <WvTrack
          key={index}
          track={track}
          participantCount={participantCount}
          aspectRatio={aspectRatio}
          isClient={isClient}
          style={style}
        />
      ))}
    </>
  )
}
