import { useEffect, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import {
  TwilioVideo,
  TwilioVideoLocalView,
  TwilioVideoParticipantView,
} from 'react-native-twilio-video-webrtc'
import { PlatformVideoCallProps, VideoCallProps } from './video-call'
import { useAlerter } from 'livelawyerlibrary/context-manager'
import { useRouter } from 'expo-router'
import { Colors } from '@/constants/Colors'
import { SafeAreaView } from 'react-native-safe-area-context'

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
    <>
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
      <View style={styles.videoContainerRemote}>
        {Array.from(videoTracks, ([trackSid, trackIdentifier]) => {
          return (
            <TwilioVideoParticipantView
              key={trackSid}
              trackIdentifier={trackIdentifier}
              style={[
                styles.video,
                { aspectRatio: roomInfo.aspectRatio * Math.max(1, videoTracks.size) },
              ]}
            />
          )
        })}
      </View>
      <SafeAreaView style={styles.videoContainerLocal}>
        <TwilioVideoLocalView
          enabled={true}
          style={[styles.video, styles.videoLocal, { aspectRatio: roomInfo.aspectRatio }]}
        />
      </SafeAreaView>
    </>
  )
}

const styles = StyleSheet.create({
  videoContainerRemote: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  video: {
    width: '100%',
    backgroundColor: Colors.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainerLocal: {
    position: 'absolute',
    width: '35%',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 18,
    bottom: 0,
    right: 0,
  },
  videoLocal: {
    borderRadius: 10,
    overflow: 'hidden',
  },
})
