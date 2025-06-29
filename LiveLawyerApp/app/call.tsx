import VideoCall from '@/components/VideoCall'
import { socket } from '@/constants/socket'
import { Styles } from '@/constants/Styles'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Button, View, Text, Alert } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { getCoordinates } from '@/components/locationStore'
import { supabase } from './lib/supabase'
export default function Call() {
  const coords = getCoordinates()
  const router = useRouter()
  const [inCall, setInCall] = useState<boolean | null>(null)
  const [token, setToken] = useState<string>('')
  const [roomName, setRoomName] = useState<string>('')
  const [disconnectSignal, setDisconnectSignal] = useState<boolean>(false)

  useEffect(() => {
    const onSendToRoom = async (
      { token, roomName }: { token: string; roomName: string },
      callback: (acknowledged: boolean) => void,
    ) => {
      setToken(token)
      setRoomName(roomName)
      setInCall(true)
      callback(true)
    }

    const onEndCall = () => {
      setDisconnectSignal(true)
    }

    socket.on('sendToRoom', onSendToRoom)
    socket.on('endCall', onEndCall)

    if (inCall === null) {
      // only runs for initialization even with strict mode
      setInCall(false)
      ;(async (): Promise<void> => {
        // Get User ID
        let userId = ''
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          userId = user?.id
        }
        // Join call
        const clientJoinStatusCode = await socket.emitWithAck('joinAsClient', {
          userId: userId,
          userSecret: 'abc',
          coordinates: coords ?? { lat: 0, lon: 0 },
        })
        if (clientJoinStatusCode === 'NO_PARALEGALS') {
          Alert.alert('There are no paralegals currently available to take your call.')
          router.back()
        } else if (clientJoinStatusCode === 'INVALID_AUTH') {
          Alert.alert('Your credentials are invalid!')
          router.back()
        }
      })()
    }

    return () => {
      socket.off('sendToRoom', onSendToRoom)
      socket.off('endCall', onEndCall)
    }
  }, [])

  const hangUp = () => {
    socket.emit('hangUp')
  }

  return (
    <View style={Styles.videoContainer}>
      {inCall ? (
        <VideoCall
          token={token}
          roomName={roomName}
          disconnectSignal={disconnectSignal}
          hangUpCallback={hangUp}
          disconnectCallback={() => {
            setInCall(false)
            router.back()
          }}
        />
      ) : (
        <SafeAreaProvider>
          <View>
            <Text>Loading...</Text>
            <Button title="Go Back" onPress={router.back} />
          </View>
        </SafeAreaProvider>
      )}
    </View>
  )
}
