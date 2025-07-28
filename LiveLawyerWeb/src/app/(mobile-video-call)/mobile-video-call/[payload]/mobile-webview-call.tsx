'use client'
import TwilioVideoRoom from '@/classes/TwilioVideoRoom'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Participant } from 'twilio-video'
import WvParticipant from './wv-participant'
import Box from '@mui/material/Box'

type Listener = (message: string) => unknown
type InjectableWindow = { NATIVE_MESSAGE_RECEIVER: NativeMessageReceiver }

class NativeMessageReceiver {
  private readonly _listeners: Set<Listener>

  constructor() {
    this._listeners = new Set()
  }

  public on(listener: Listener) {
    this._listeners.add(listener)
  }

  public off(listener: Listener) {
    this._listeners.delete(listener)
  }

  public fire(message: string) {
    this._listeners.forEach(listener => listener(message))
  }
}

;(window as unknown as InjectableWindow).NATIVE_MESSAGE_RECEIVER = new NativeMessageReceiver()

export interface RoomJoinData {
  token: string
  roomName: string
  aspectRatio: number
}

interface MobileWebViewCallProps {
  payload: string
}

export function MobileWebViewCall({ payload }: MobileWebViewCallProps) {
  const roomInfo: RoomJoinData = useMemo(
    () => JSON.parse(atob(decodeURIComponent(payload))) as RoomJoinData,
    [payload],
  )

  const videoRoomRef = useRef<TwilioVideoRoom>(new TwilioVideoRoom())
  const joinInProgressRef = useRef<boolean>(false)
  const [participants, setParticipants] = useState<Participant[]>([])

  const log = useCallback((msg: string) => postMessage('%' + msg), [])
  const postMessage = (message: string) => {
    eval(`window.ReactNativeWebView.postMessage("${message.replaceAll('"', '\\"')}")`)
  }

  useEffect(() => {
    document.body.classList.add('hide-nextjs-error-overlay')
    return () => document.body.classList.remove('hide-nextjs-error-overlay')
  }, [])

  // Connecting to call when component mounts:
  useEffect(() => {
    if (roomInfo !== undefined && !joinInProgressRef.current) {
      joinInProgressRef.current = true
      videoRoomRef.current
        .joinRoom(roomInfo.token, roomInfo.roomName)
        .then(() => {
          log('Joining room...')
          const [disconnectTrigger] = videoRoomRef.current.setupListeners(setParticipants)
          window.addEventListener('pagehide', disconnectTrigger)
          window.addEventListener('beforeunload', disconnectTrigger)
          postMessage('callback true')
        })
        .catch(error => {
          log('Room join error!')
          log(`The initial join error:\n${(error as Error).message}`)
          postMessage('callback false')
        })
        .finally(() => (joinInProgressRef.current = false))
    }
  }, [log, roomInfo])

  const flipCamera = useCallback((flipped: boolean) => {
    const tracks = videoRoomRef.current.room?.localParticipant.videoTracks
    const track = tracks?.values().next().value?.track
    if (track !== undefined) {
      track.restart({ facingMode: flipped ? 'environment' : 'user' })
    } else {
      postMessage('noLocalVideoTrack')
    }
  }, [])

  useEffect(() => {
    const onMessage = (message: string) => {
      switch (message) {
        case 'onEndCall':
          videoRoomRef.current.disconnect()
          setParticipants([])
          postMessage('dismount')
          break
        case 'onFlipCamera true':
          flipCamera(true)
          break
        case 'onFlipCamera false':
          flipCamera(false)
          break
      }
    }

    ;(window as unknown as InjectableWindow).NATIVE_MESSAGE_RECEIVER.on(onMessage)
    return () => (window as unknown as InjectableWindow).NATIVE_MESSAGE_RECEIVER.off(onMessage)
  }, [flipCamera])

  return (
    <>
      <Box sx={styles.videoContainerRemote}>
        {participants
          .filter(x => x !== videoRoomRef.current.room?.localParticipant)
          .map(participant => (
            <WvParticipant
              key={participant.identity}
              room={videoRoomRef.current}
              participantCount={participants.length}
              aspectRatio={roomInfo.aspectRatio}
              isClient={false}
              participant={participant}
              style={styles.video}
            />
          ))}
      </Box>
      <Box sx={styles.videoContainerLocal}>
        {videoRoomRef.current.room?.localParticipant && (
          <WvParticipant
            room={videoRoomRef.current}
            participantCount={participants.length}
            aspectRatio={roomInfo.aspectRatio}
            isClient={true}
            participant={videoRoomRef.current.room.localParticipant}
            style={{ ...styles.video, ...styles.videoLocal }}
          />
        )}
      </Box>
    </>
  )
}

const styles = {
  videoContainerRemote: {
    flex: 1,
    backgroundColor: 'black',
  },
  video: {
    backgroundColor: 'gray',
  },
  videoContainerLocal: {
    position: 'absolute',
    width: '35%',
    margin: 3,
    bottom: 0,
    right: 0,
  },
  videoLocal: {
    borderRadius: 10,
    overflow: 'hidden',
  },
}
