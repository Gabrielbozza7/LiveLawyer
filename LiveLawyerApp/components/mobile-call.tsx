import { RoomJoinData } from '@/app/call'
import { newStyles } from '@/constants/Styles'
import { useRouter } from 'expo-router'
import { useAlerter } from 'livelawyerlibrary/context-manager'
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from 'livelawyerlibrary/socket-event-definitions'
import { RefObject, useEffect, useState } from 'react'
import { View } from 'react-native'
import { FAB, Portal } from 'react-native-paper'
import { WebView } from 'react-native-webview'
import { Socket } from 'socket.io-client'

interface MobileCallProps {
  socketRef: RefObject<Socket<ServerToClientEvents, ClientToServerEvents>>
  socketTokenRef: RefObject<string>
  roomInfo: RoomJoinData
}

export default function MobileCall({ socketRef, socketTokenRef, roomInfo }: MobileCallProps) {
  const alerterRef = useAlerter()
  const router = useRouter()
  const [speedDialOpen, setSpeedDialOpen] = useState<boolean>(false)
  const [hash, setHash] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const onEndCall = () => {
      setHash('onEndCall')
      router.back()
    }

    const socket = socketRef.current!
    console.log('got here')
    console.log(
      `/mobile-video-call/${btoa(JSON.stringify({ token: roomInfo.token, roomName: roomInfo.roomName }))}${hash !== '' ? `#${hash}` : ''}`,
    )
    socket.on('endCall', onEndCall)
    return () => {
      socket.off('endCall', onEndCall)
    }
  }, [socketRef])

  const onEndCallClick = async () => {
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
  }

  return (
    <View style={{ position: 'relative' }}>
      <Portal.Host>
        <WebView
          source={{
            // TODO: Add actual website link
            uri: `/mobile-video-call/${btoa(JSON.stringify({ token: roomInfo.token, roomName: roomInfo.roomName }))}${hash !== '' ? `#${hash}` : ''}`,
          }}
          onMessage={event => {
            switch (event.nativeEvent.data) {
              case 'callback true':
                roomInfo.callback(true)
                break
              case 'callback false':
                roomInfo.callback(false)
                break
            }
          }}
          style={{ flex: 1 }}
        />
        <Portal>
          <FAB.Group
            open={speedDialOpen}
            visible
            icon={speedDialOpen ? 'close' : 'menu'}
            actions={[
              {
                icon: 'phone-hangup',
                label: 'End Call',
                onPress: onEndCallClick,
              },
            ]}
            onStateChange={({ open }) => setSpeedDialOpen(open)}
            onPress={() => (loading ? setSpeedDialOpen(open => !open) : (() => {})())}
            variant="surface"
            style={newStyles.bottomLeftFab}
          />
        </Portal>
      </Portal.Host>
    </View>
  )
}
