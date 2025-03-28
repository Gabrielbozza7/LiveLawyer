import { Styles } from '@/constants/Styles'
import { useEffect, useRef, useState } from 'react'
<<<<<<< HEAD
import { Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
=======
import { Text, View } from 'react-native'
>>>>>>> dbe75cdadb34d099eb986361dfc8c55112b3f2b9
import {
  TwilioVideo,
  TwilioVideoLocalView,
  TwilioVideoParticipantView,
} from 'react-native-twilio-video-webrtc'

type Status = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED'

interface VideoTrackInfo {
  participantSid: string
  videoTrackSid: string
}

interface VideoCallProps {
  token: string
  roomName: string
}

export default function VideoCall({ token, roomName }: VideoCallProps) {
  const [status, setStatus] = useState<Status>('DISCONNECTED')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [videoTracks, setVideoTracks] = useState<Map<string, VideoTrackInfo>>(new Map())
  const twilioVideo = useRef<TwilioVideo>(null)

  const noteError = (error: unknown) => {
    if (error instanceof Error) {
      setErrorMessage(`${error.name}: ${error.message}`)
      console.log(`${error.name}: ${error.message}`)
      console.log(error.stack)
    } else if (typeof error === 'string') {
      setErrorMessage(error)
      console.log(error)
    } else {
      setErrorMessage('Error type not known')
      console.log('Error type not known')
    }
  }

  useEffect(() => {
    if (twilioVideo.current != null) {
      setStatus('CONNECTING')
      try {
        twilioVideo.current.connect({
          roomName: roomName,
          accessToken: token,
        })
      } catch (error: unknown) {
        noteError(error)
      }
    } else {
      noteError('Required ref to TwilioVideo is somehow null!')
    }
  }, [])

  useEffect(() => {
    console.log(`videoTracks size: ${videoTracks.size}`)
  }, [videoTracks.size])

  return (
    <View style={Styles.videoContainer}>
      {errorMessage === '' ? (
        <View style={Styles.videoContainer}>
          {status === 'DISCONNECTED' ? (
            <Text>You have disconnected.</Text>
          ) : status === 'CONNECTING' ? (
            <Text>Connecting...</Text>
          ) : (
            <View style={Styles.videoContainer}>
              {Array.from(videoTracks, ([trackSid, trackIdentifier]) => {
                return (
                  <TwilioVideoParticipantView
                    key={trackSid}
                    trackIdentifier={trackIdentifier}
                    style={Styles.videoRemote}
                  />
                )
              })}
<<<<<<< HEAD
                <TwilioVideoLocalView enabled={true} style={Styles.videoLocal} />
            </SafeAreaView>
=======
              <TwilioVideoLocalView enabled={true} style={Styles.videoLocal} />
            </View>
>>>>>>> dbe75cdadb34d099eb986361dfc8c55112b3f2b9
          )}
        </View>
      ) : (
        <Text>
          An unexpected error occurred:{'\n\n\n'}
          {errorMessage}
        </Text>
      )}
      <TwilioVideo
        ref={twilioVideo}
        onRoomDidConnect={() => setStatus('CONNECTED')}
        onRoomDidDisconnect={error => {
          noteError(error)
          setStatus('DISCONNECTED')
        }}
        onRoomDidFailToConnect={error => {
          noteError(error)
          setStatus('DISCONNECTED')
        }}
        onParticipantAddedVideoTrack={({ participant, track }) => {
          setVideoTracks(originalVideoTracks => {
            originalVideoTracks.set(track.trackSid, {
              participantSid: participant.sid,
              videoTrackSid: track.trackSid,
            })
            return new Map(originalVideoTracks)
          })
        }}
        onParticipantRemovedVideoTrack={({ track }) => {
          setVideoTracks(originalVideoTracks => {
            originalVideoTracks.delete(track.trackSid)
            return new Map(originalVideoTracks)
          })
        }}
      />
    </View>
  )
}
