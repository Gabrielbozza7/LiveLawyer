import { Styles } from '@/constants/Styles'
import { useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { Button, View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getCoordinates } from '@/components/locationStore'
import { io, Socket } from 'socket.io-client'
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from 'livelawyerlibrary/socket-event-definitions'
import { BACKEND_URL } from '@/constants/BackendVariables'
import { useAlerter, useSession } from 'livelawyerlibrary/context-manager'
import MobileCall from '@/components/mobile-call'

export interface RoomJoinData {
  token: string
  roomName: string
  callback: (acknowledged: boolean) => void
}

export default function Call() {
  const alerterRef = useAlerter()
  const sessionRef = useSession()
  const coordinates = getCoordinates()
  const router = useRouter()
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents>>(
    io(BACKEND_URL, { autoConnect: false }),
  )
  const socketTokenRef = useRef<string>('')
  const [inCall, setInCall] = useState<RoomJoinData | false | null>(null)

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
            coordinates,
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
    <View style={Styles.videoContainer}>
      {inCall ? (
        // <VideoCall
        //   token={token}
        //   roomName={roomName}
        //   disconnectSignal={disconnectSignal}
        //   hangUpCallback={onEndCallClick}
        //   disconnectCallback={() => {
        //     setInCall(false)
        //     router.back()
        //   }}
        // />
        <MobileCall
          socketRef={socketRef}
          socketTokenRef={socketTokenRef}
          roomInfo={inCall}
        ></MobileCall>
      ) : (
        <SafeAreaView>
          <Text>Loading...</Text>
          <Button title="Go Back" onPress={router.back} />
        </SafeAreaView>
      )}
    </View>
  )
}
