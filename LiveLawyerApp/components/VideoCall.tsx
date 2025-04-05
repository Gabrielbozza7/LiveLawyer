import { Styles } from '@/constants/Styles'
import { useEffect, useRef, useState } from 'react'
<<<<<<< HEAD
import { Text, View } from 'react-native'
=======
import { Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
>>>>>>> 18361a6e10b901c1ae06d3b9700decdb0526f380
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
<<<<<<< HEAD
}

export default function VideoCall({ token, roomName }: VideoCallProps) {
  const [status, setStatus] = useState<Status>('DISCONNECTED')
=======
  disconnectSignal: boolean
  hangUpCallback: () => void
  disconnectCallback?: () => void
}

export default function VideoCall({
  token,
  roomName,
  disconnectSignal,
  hangUpCallback,
  disconnectCallback,
}: VideoCallProps) {
  const latestStatus = useRef<Status>('CONNECTING')
>>>>>>> 18361a6e10b901c1ae06d3b9700decdb0526f380
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
<<<<<<< HEAD
    console.log(`videoTracks size: ${videoTracks.size}`)
  }, [videoTracks.size])
=======
    if (disconnectSignal) {
      twilioVideo.current!.disconnect()
      latestStatus.current = 'DISCONNECTED'
    }
  }, [disconnectSignal])

  useEffect(() => {
    if (latestStatus.current === 'DISCONNECTED' && disconnectCallback !== undefined) {
      disconnectCallback()
    }
  }, [latestStatus.current])
>>>>>>> 18361a6e10b901c1ae06d3b9700decdb0526f380

  return (
    <View style={Styles.videoContainer}>
      {errorMessage === '' ? (
        <View style={Styles.videoContainer}>
          {latestStatus.current === 'DISCONNECTED' ? (
            <SafeAreaProvider>
              <Text>You have disconnected.</Text>
            </SafeAreaProvider>
          ) : latestStatus.current === 'CONNECTING' ? (
            <SafeAreaProvider>
              <Text>Connecting...</Text>
            </SafeAreaProvider>
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
=======
              <View style={Styles.videoBottomContainer}>
                <View style={Styles.videoButtonContainer}>
                  <TouchableOpacity
                    style={Styles.videoButton}
                    onPress={() => {
                      twilioVideo.current!.flipCamera()
                    }}
                  >
                    <Text>FLIP CAMERA</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={Styles.videoButton} onPress={hangUpCallback}>
                    <Text>LEAVE CALL</Text>
                  </TouchableOpacity>
                </View>
                <TwilioVideoLocalView enabled={true} style={Styles.videoLocal} />
              </View>
>>>>>>> 18361a6e10b901c1ae06d3b9700decdb0526f380
            </View>
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
        onRoomDidConnect={() => {
          latestStatus.current = 'CONNECTED'
        }}
        onRoomDidDisconnect={error => {
          noteError(error)
          latestStatus.current = 'DISCONNECTED'
        }}
        onRoomDidFailToConnect={error => {
          noteError(error)
          latestStatus.current = 'DISCONNECTED'
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
