import { Styles } from '@/constants/Styles'
import { useEffect, useRef, useState } from 'react'
import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
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
    <SafeAreaView style={Styles.videoContainer}>
      {errorMessage === '' ? (
        <View style={Styles.videoContainer}>
          {status === 'DISCONNECTED' ? (
            <Text>You have disconnected.</Text>
          ) : status === 'CONNECTING' ? (
            <Text>Connecting...</Text>
          ) : (
            <SafeAreaView style={Styles.videoContainer}>
              {Array.from(videoTracks, ([trackSid, trackIdentifier]) => {
                return (
                  <TwilioVideoParticipantView
                    key={trackSid}
                    trackIdentifier={trackIdentifier}
                    style={Styles.videoRemote}
                  />
                )
              })}
              <TwilioVideoLocalView enabled={true} style={Styles.videoLocal} />
            </SafeAreaView>
            // <SafeAreaView style={Styles.videoContainer}>
            //   {/* Remote Participant Video (Fills Screen) */}
            //   <View style={Styles.videoRemote}>
            //     <Text style={Styles.videoText}>NAME</Text>
            //   </View>

            //   {/* Local User Video (Small floating at bottom-right) */}
            //   <View style={Styles.videoLocal}>
            //     <Text style={Styles.videoText}>LOCAL USER</Text>
            //   </View>
            // </SafeAreaView>
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
    </SafeAreaView>
  )
}
