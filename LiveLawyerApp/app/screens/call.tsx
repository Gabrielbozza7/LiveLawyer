import { useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { io, Socket } from 'socket.io-client'
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from 'livelawyerlibrary/socket-event-definitions'
import { useAlerter, usePublicEnv, useSession } from 'livelawyerlibrary/context-manager'
import VideoCall from '@/components/video-call/video-call'
import { getCurrentPositionAsync } from 'expo-location'
import { ActivityIndicator, FAB } from 'react-native-paper'
import { newStyles } from '@/constants/Styles'
import { useWindowDimensions } from 'react-native'

export interface RoomJoinData {
  token: string
  roomName: string
  callback: (acknowledged: boolean) => void
}

export default function Call() {
  const env = usePublicEnv()
  const alerterRef = useAlerter()
  const sessionRef = useSession()
  const router = useRouter()
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents>>(
    io(env.websiteUrl, {
      path: '/api/backend/socket',
      addTrailingSlash: false,
      autoConnect: false,
    }),
  )
  const socketTokenRef = useRef<string>('')
  const [inCall, setInCall] = useState<RoomJoinData | false | null>(null)
  const { width, height } = useWindowDimensions()
  const aspectRatio = width / height

  const onSendToRoom = async (
    { token, roomName }: { token: string; roomName: string },
    callback: (acknowledged: boolean) => void,
  ) => {
    setInCall({ token, roomName, callback })
    callback(true)
  }

  useEffect(() => {
    if (inCall === null) {
      // Only runs for initialization even with strict mode
      setInCall(false)
      ;(async (): Promise<void> => {
        const coordinates = await getCurrentPositionAsync({})
        if (coordinates === null) {
          alerterRef.current.error(
            "Your location could not be read! Try restarting the app or changing the app's permissions",
          )
          router.back()
        } else {
          socketRef.current.on('sendToRoom', onSendToRoom)
          socketRef.current.on('disconnect', () => {
            // This can be eventually changed to account for reconnection attempts.
            socketRef.current?.removeAllListeners()
          })
          let connectPromiseResolver = () => {}
          const connectPromise = new Promise<void>(resolve => {
            connectPromiseResolver = resolve
          })
          socketRef.current.on('connect', connectPromiseResolver)
          socketRef.current.connect()
          await connectPromise
          socketRef.current.off('connect', connectPromiseResolver)
          const authResult = await socketRef.current.emitWithAck('authenticate', {
            accessToken: sessionRef.current.access_token,
            coordinates: { lat: coordinates.coords.latitude, lon: coordinates.coords.longitude },
            aspectRatio,
          })
          if (authResult.result === 'INVALID_AUTH') {
            alerterRef.current.error('Your session is invalid! Try logging in again.')
            router.back()
          } else {
            socketTokenRef.current = authResult.socketToken
            // Joining call:
            const joinResult = await socketRef.current.emitWithAck('joinAsClient', {
              socketToken: socketTokenRef.current,
            })
            if (joinResult === 'INVALID_AUTH') {
              alerterRef.current.error('Your session is invalid! Try logging in again.')
              router.back()
            } else if (joinResult === 'NO_OBSERVERS') {
              alerterRef.current.error(
                'There are no observers currently available to take your call.',
              )
              router.back()
            } else if (joinResult === 'ALREADY_IN_ROOM') {
              alerterRef.current.error('You are already in a room!')
              router.back()
            }
          }
        }
      })()
    }

    return () => {
      socketRef.current.disconnect()
    }
  }, [])

  return (
    <>
      {inCall ? (
        <VideoCall roomInfo={inCall} socketRef={socketRef} socketTokenRef={socketTokenRef} />
      ) : (
        <SafeAreaView>
          <ActivityIndicator />
          <FAB
            icon="cancel"
            label="Go Back"
            uppercase={true}
            onPress={router.back}
            mode="elevated"
            variant="surface"
            style={[newStyles.fab, newStyles.spacedCard]}
          />
        </SafeAreaView>
      )}
    </>
  )
}
