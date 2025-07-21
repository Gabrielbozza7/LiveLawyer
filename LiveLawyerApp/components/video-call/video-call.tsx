import { RoomJoinData } from '@/app/screens/call'
import { newStyles } from '@/constants/Styles'
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from 'livelawyerlibrary/socket-event-definitions'
import { Dispatch, RefObject, SetStateAction, useEffect, useState } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import { FAB } from 'react-native-paper'
import { Socket } from 'socket.io-client'
import VideoCallAndroid from './video-call-android'
import VideoCallIos from './video-call-ios'
import { useAlerter } from 'livelawyerlibrary/context-manager'
import { FabWithConfirmation } from '../ui/fab-with-confirmation'
import { SafeAreaView } from 'react-native-safe-area-context'

export interface VideoCallProps {
  roomInfo: RoomJoinData
  socketRef: RefObject<Socket<ServerToClientEvents, ClientToServerEvents>>
  socketTokenRef: RefObject<string>
}

export interface PlatformVideoCallProps {
  flippedCamera: boolean
  loadingState: [boolean, Dispatch<SetStateAction<boolean>>]
}

export default function VideoCall({ roomInfo, socketRef, socketTokenRef }: VideoCallProps) {
  const alerterRef = useAlerter()
  const [loading, setLoading] = useState<boolean>(true)
  const [flippedCamera, setFlippedCamera] = useState<boolean>(false)
  const [hungUp, setHungUp] = useState<boolean>(false)

  // Handling when this client hangs up:
  useEffect(() => {
    if (hungUp) {
      ;(async () => {
        if (!socketRef.current!.connected) {
          alerterRef.current.error('Your connection is broken!')
          return
        }
        setLoading(true)
        const hangUpResult = await socketRef.current!.emitWithAck('hangUp', {
          socketToken: socketTokenRef.current!,
        })
        if (hangUpResult === 'INVALID_AUTH') {
          alerterRef.current.error('Your login is invalid!')
        } else if (hangUpResult === 'NOT_IN_ROOM') {
          alerterRef.current.error('You are not in a room!')
        } else if (hangUpResult === 'CALL_ALREADY_ENDED') {
          alerterRef.current.error('The call already ended!')
        }
        setLoading(false)
      })()
    }
  }, [hungUp])

  return (
    <View style={styles.videoScreen}>
      {Platform.select({
        ios: (
          <VideoCallIos
            roomInfo={roomInfo}
            socketRef={socketRef}
            socketTokenRef={socketTokenRef}
            flippedCamera={flippedCamera}
            loadingState={[loading, setLoading]}
          />
        ),
        android: (
          <VideoCallAndroid
            roomInfo={roomInfo}
            socketRef={socketRef}
            socketTokenRef={socketTokenRef}
            flippedCamera={flippedCamera}
            loadingState={[loading, setLoading]}
          />
        ),
      })}
      <SafeAreaView style={newStyles.bottomLeftFab}>
        <View style={newStyles.rowContainer}>
          <FAB
            icon="camera-flip"
            disabled={loading}
            onPress={() => setFlippedCamera(flipped => !flipped)}
            mode="elevated"
            variant="surface"
            style={[newStyles.staticPositioning, { marginEnd: newStyles.bottomLeftFab.margin }]}
          />
          <FabWithConfirmation
            icon="phone-hangup"
            prompt="End Call?"
            disabled={loading}
            onConfirm={() => setHungUp(true)}
            animateFrom="left"
            style={newStyles.staticPositioning}
          />
        </View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  videoScreen: { position: 'relative', flex: 1 },
})
