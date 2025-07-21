import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { WebView } from 'react-native-webview'
import { PlatformVideoCallProps, VideoCallProps } from './video-call'
import { StyleSheet } from 'react-native'

export default function VideoCallAndroid({
  roomInfo,
  socketRef,
  loadingState: [, setLoading],
}: VideoCallProps & PlatformVideoCallProps) {
  const router = useRouter()
  const [hash, setHash] = useState<string>('')

  // Applying listener for when the call ends:
  useEffect(() => {
    const onEndCall = () => {
      setHash('onEndCall')
      router.back()
    }

    const socket = socketRef.current!
    socket.on('endCall', onEndCall)
    return () => {
      socket.off('endCall', onEndCall)
    }
  }, [socketRef])

  return (
    <WebView
      source={{
        // TODO: Add actual website link
        uri: `http://localhost:3000/mobile-video-call/${encodeURIComponent(btoa(JSON.stringify({ token: roomInfo.token, roomName: roomInfo.roomName })))}${hash !== '' ? `#${hash}` : ''}`,
      }}
      onMessage={event => {
        switch (event.nativeEvent.data) {
          case 'callback true':
            setLoading(false)
            roomInfo.callback(true)
            break
          case 'callback false':
            setLoading(false)
            roomInfo.callback(false)
            break
        }
      }}
      style={styles.flexContainer}
    />
  )
}

const styles = StyleSheet.create({
  flexContainer: { flex: 1 },
})
