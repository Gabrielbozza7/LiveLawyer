import { Styles } from '@/constants/Styles'
import { useEffect, useRef, useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
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
  onDisconnect?: () => void
}

export default function VideoCall({ token, roomName, onDisconnect }: VideoCallProps) {
  const [status, setStatus] = useState<Status>('CONNECTING')
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
    if (status === 'DISCONNECTED' && onDisconnect !== undefined) {
      onDisconnect()
    }
  }, [status])

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
                  <TouchableOpacity
                    style={Styles.videoButton}
                    onPress={() => {
                      twilioVideo.current!.disconnect()
                      setStatus('DISCONNECTED')
                    }}
                  >
                    <Text>LEAVE CALL</Text>
                  </TouchableOpacity>
                </View>
                <TwilioVideoLocalView enabled={true} style={Styles.videoLocal} />
              </View>
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
