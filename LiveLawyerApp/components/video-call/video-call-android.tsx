import { useRouter } from 'expo-router'
import { useEffect, useRef } from 'react'
import { WebView } from 'react-native-webview'
import { PlatformVideoCallProps, VideoCallProps } from './video-call'
import { StyleSheet } from 'react-native'

export default function VideoCallAndroid({
  roomInfo,
  socketRef,
  loadingState: [, setLoading],
}: VideoCallProps & PlatformVideoCallProps) {
  const router = useRouter()
  const webViewRef = useRef<WebView>(null)

  const postMessage = (message: string) => {
    const webView = webViewRef.current !== null ? webViewRef.current : null
    if (webView !== null) {
      const injection = `window.NATIVE_MESSAGE_RECEIVER.fire("${message.replaceAll('"', '\\"')}"); true;`
      webView.injectJavaScript(injection)
    } else {
      console.log('Found null WebView ref, unable to send message!')
    }
  }

  // Applying listener for when the call ends:
  useEffect(() => {
    const socket = socketRef.current !== null ? socketRef.current : null
    if (socket !== null) {
      const onEndCall = () => {
        postMessage('onEndCall')
      }

      console.log(
        `http://10.0.0.186:3000/mobile-video-call/${encodeURIComponent(btoa(JSON.stringify({ token: roomInfo.token, roomName: roomInfo.roomName })))}`,
      )

      socket.on('endCall', onEndCall)
      return () => {
        socket.off('endCall', onEndCall)
      }
    }
  }, [socketRef])

  return (
    <>
      <WebView
        ref={webViewRef}
        source={{
          // TODO: Add actual website link
          uri: `http://10.0.0.186:3000/mobile-video-call/${encodeURIComponent(btoa(JSON.stringify({ token: roomInfo.token, roomName: roomInfo.roomName })))}`,
        }}
        onMessage={event => {
          switch (event.nativeEvent.data) {
            case 'callback false':
              setLoading(false)
              roomInfo.callback(false)
              break
            case 'callback true':
              setLoading(false)
              roomInfo.callback(true)
              break
            case 'dismount':
              router.back()
              break
          }
        }}
        style={styles.flexContainer}
      />
    </>
  )
}

const styles = StyleSheet.create({
  flexContainer: { flex: 1 },
})
