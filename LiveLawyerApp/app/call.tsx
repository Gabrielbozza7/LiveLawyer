import VideoCall from '@/components/VideoCall'
import { Styles } from '@/constants/Styles'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Button, View } from 'react-native'

export default function Call() {
  const router = useRouter()
  const { token, roomName } = useLocalSearchParams()
  const [valid, setValid] = useState<boolean>(false)
  const [finalToken, setFinalToken] = useState<string>('')
  const [finalRoomName, setFinalRoomName] = useState<string>('')

  useEffect(() => {
    if (typeof token !== 'string' || typeof roomName !== 'string') {
      router.back()
    } else {
      setFinalToken(token)
      setFinalRoomName(roomName)
      setValid(true)
    }
  }, [])

  return (
    <View style={Styles.videoContainer}>
      {valid ? (
        <VideoCall token={finalToken} roomName={finalRoomName} />
      ) : (
        <Button title="Go Back" onPress={() => router.back()} />
      )}
    </View>
  )
}
