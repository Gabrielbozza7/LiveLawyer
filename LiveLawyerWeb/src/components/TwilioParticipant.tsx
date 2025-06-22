import { useEffect, useRef, useState } from 'react'
import { Participant, Track } from 'twilio-video'
import TwilioVideoRoom from '../classes/TwilioVideoRoom'
import { twilioIdentityToInfo } from 'livelawyerlibrary'
import { MediaTrack } from 'twilio-video/tsdef/MediaTrack'

interface TwilioVideoParticipantProps {
  participant: Participant
  room: TwilioVideoRoom
}

// This component should be mounted when the participant joins and dismounted when the participant leaves.
export default function TwilioParticipant({ participant, room }: TwilioVideoParticipantProps) {
  const [tracks, setTracks] = useState<MediaTrack[]>([])
  const activeTracks = useRef<Map<MediaTrack, HTMLMediaElement>>(new Map())
  const trackDivRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleTrackPublication = (trackPublication: any) => {
      function displayTrack(track: Track) {
        if (track != null && track != undefined) {
          if (track.kind === 'video' || track.kind === 'audio') {
            if (tracks.findIndex(t => track == t) === -1) {
              tracks.push(track as MediaTrack)
              setTracks([...tracks, track as MediaTrack])
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
    return () => {
      participant.removeAllListeners()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Updating the track div with new media elements when there are more tracks and deleting them when necessary:
  useEffect(() => {
    const mentionedTracks: Set<Track> = new Set()
    tracks.forEach(track => {
      if (trackDivRef.current === null) {
        console.log('Null div!')
      } else {
        mentionedTracks.add(track)
        if (!activeTracks.current.has(track)) {
          const child = track.attach()
          child.style = JSON.stringify({
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            height: '100%',
          })
          activeTracks.current.set(track, child)
          trackDivRef.current.appendChild(child)
        }
      }
    })
    const activeTracksToDelete: MediaTrack[] = []
    activeTracks.current.forEach((child, track) => {
      if (!mentionedTracks.has(track)) {
        activeTracksToDelete.push(track)
        track.detach(child)
      }
    })
    activeTracksToDelete.forEach(track => {
      activeTracks.current.delete(track)
    })
  }, [tracks])

  return (
    <div
      style={{
        width: 360,
        height: 640,
        overflow: 'hidden',
        position: 'relative',
        border: '2px solid blue',
        margin: 5,
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: 5 }}>
        {twilioIdentityToInfo(participant.identity).userType}
      </div>
      <div ref={trackDivRef} />
    </div>
  )
}
