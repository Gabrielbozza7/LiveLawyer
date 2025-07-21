import { Styles } from '@/constants/Styles'
import { useEffect, useRef, useState } from 'react'
import { View } from 'react-native'
import {
  TwilioVideo,
  TwilioVideoLocalView,
  TwilioVideoParticipantView,
} from 'react-native-twilio-video-webrtc'
import { PlatformVideoCallProps, VideoCallProps } from './video-call'
import { useAlerter } from 'livelawyerlibrary/context-manager'
import { useRouter } from 'expo-router'

interface VideoTrackInfo {
  participantSid: string
  videoTrackSid: string
}

export default function VideoCallIos({
  roomInfo,
  socketRef,
  flippedCamera,
  loadingState: [loading, setLoading],
}: VideoCallProps & PlatformVideoCallProps) {
  const router = useRouter()
  const alerterRef = useAlerter()
  const [videoTracks, setVideoTracks] = useState<Map<string, VideoTrackInfo>>(new Map())
  const twilioVideo = useRef<TwilioVideo>(null)

  // Applying listener for when the call ends:
  useEffect(() => {
    const onEndCall = () => {
      twilioVideo.current!.disconnect()
      router.back()
    }

    const socket = socketRef.current!
    socket.on('endCall', onEndCall)
    return () => {
      socket.off('endCall', onEndCall)
    }
  }, [socketRef])

  useEffect(() => {
    if (!loading) {
      twilioVideo.current!.flipCamera()
    }
  }, [flippedCamera])

  // Connecting to call when component mounts:
  useEffect(() => {
    if (twilioVideo.current != null) {
      try {
        twilioVideo.current.connect({
          roomName: roomInfo.roomName,
          accessToken: roomInfo.token,
        })
      } catch (error: unknown) {
        alerterRef.current.error(`An error occcurred: ${(error as Error).message}`)
      }
    } else {
      // This shouldn't ever happen.
      alerterRef.current.error('An unrecoverable error has occurred!')
    }
  }, [])

  return (
    <View style={Styles.videoContainer}>
      <TwilioVideo
        ref={twilioVideo}
        onRoomDidConnect={() => setLoading(false)}
        onRoomDidDisconnect={error => {
          alerterRef.current.error(`An error occcurred: ${(error.error as Error).message}`)
          router.back()
        }}
        onRoomDidFailToConnect={error => {
          setLoading(false)
          alerterRef.current.error(`An error occcurred: ${(error.error as Error).message}`)
          router.back()
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
          <TwilioVideoLocalView enabled={true} style={Styles.videoLocal} />
        </View>
      </View>
    </View>
  )
}
