import VideoCall from '@/components/VideoCall'
import { socket } from '@/constants/socket'
import { Styles } from '@/constants/Styles'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Button, View, Text, Alert } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

export default function Call() {
  const router = useRouter()
  const [inCall, setInCall] = useState<boolean | null>(null)
  const [token, setToken] = useState<string>('')
  const [roomName, setRoomName] = useState<string>('')
  const [disconnectSignal, setDisconnectSignal] = useState<boolean>(false)

  useEffect(() => {
    const onSendToRoom = async ({ token, roomName }: { token: string; roomName: string }) => {
      setToken(token)
      setRoomName(roomName)
      setInCall(true)
    }

    const onRejectFromNoParalegals = () => {
      Alert.alert('There are no paralegals currently available to take your call.')
      router.back()
    }

    const onEndCall = () => {
      setDisconnectSignal(true)
    }

    socket.on('sendToRoom', onSendToRoom)
    socket.on('rejectFromNoParalegals', onRejectFromNoParalegals)
    socket.on('endCall', onEndCall)

    if (inCall === null) {
      setInCall(false)
      socket.emit('joinAsClient', { userId: '12345' })
    }

    return () => {
      socket.off('sendToRoom', onSendToRoom)
      socket.off('rejectFromNoParalegals', onRejectFromNoParalegals)
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
