import { useEffect, useState } from 'react'
import { Participant } from 'twilio-video'
import { MediaTrack } from 'twilio-video/tsdef/MediaTrack'
import TwilioTrack from './TwilioTrack'
import TwilioVideoRoom from '../classes/TwilioVideoRoom'

interface TwilioVideoParticipantProps {
  participant: Participant
  room: TwilioVideoRoom
}

// This component should be mounted when the participant joins and dismounted when the participant leaves.
export default function TwilioParticipant({ participant, room }: TwilioVideoParticipantProps) {
  const [tracks] = useState<MediaTrack[]>([])
  const [trackUpdateFlag, setTrackUpdateFlag] = useState<number[]>([])
  const [renderTracks, setRenderTracks] = useState<MediaTrack[]>([])

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleTrackPublication = (trackPublication: any) => {
      function displayTrack(track: MediaTrack) {
        if (track != null && track != undefined) {
          if (tracks.findIndex(t => track == t) === -1) {
            tracks.push(track)
            setTrackUpdateFlag([0])
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

    const handleDisconnectedParticipant = () => {
      participant.removeAllListeners()
      tracks.splice(0, tracks.length)
      setTrackUpdateFlag([0])
    }

    handleConnectedParticipant()
    return () => {
      handleDisconnectedParticipant()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setRenderTracks([...tracks])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackUpdateFlag])

  return (
    <div style={{ borderStyle: 'solid', borderColor: 'blue', margin: 5 }}>
      {renderTracks.map(track => (
        <TwilioTrack key={track.kind} track={track} />
      ))}
    </div>
  )
}
