'use client'
import TwilioVideoRoom from '@/classes/TwilioVideoRoom'
import Grid from '@mui/material/Grid'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Participant } from 'twilio-video'
import WvParticipant from './wv-participant'

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

setTimeout(() => (window as unknown as InjectableWindow).NATIVE_MESSAGE_RECEIVER.fire('test'), 5000)

export interface RoomJoinData {
  token: string
  roomName: string
  callback: (acknowledged: boolean) => void
}

interface MobileWebViewCallProps {
  payload: string
}

export function MobileWebViewCall({ payload }: MobileWebViewCallProps) {
  const roomInfo = useMemo(
    () =>
      JSON.parse(atob(decodeURIComponent(payload))) as {
        token: string
        roomName: string
      },
    [payload],
  )
  const [debugLog, setDebugLog] = useState<string>(JSON.stringify(roomInfo) + '\n')
  const log = (msg: string) => setDebugLog(l => l + msg + '\n')

  const videoRoomRef = useRef<TwilioVideoRoom>(new TwilioVideoRoom())
  const joinInProgressRef = useRef<boolean>(false)
  const [participants, setParticipants] = useState<Participant[]>([])

  useEffect(() => {
    log('new participants size: ' + participants.length)
  }, [participants])

  const postMessage = (message: string) => {
    eval(`window.ReactNativeWebView.postMessage("${message.replaceAll('"', '\\"')}")`)
  }

  // Connecting to call when component mounts:
  useEffect(() => {
    if (roomInfo !== undefined && !joinInProgressRef.current) {
      joinInProgressRef.current = true
      videoRoomRef.current
        .joinRoom(roomInfo.token, roomInfo.roomName)
        .then(() => {
          log('initial join THEN')
          const [disconnectTrigger] = videoRoomRef.current.setupListeners(setParticipants)
          window.addEventListener('pagehide', disconnectTrigger)
          window.addEventListener('beforeunload', disconnectTrigger)
          postMessage('callback true')
        })
        .catch(error => {
          log('initial join CATCH')
          log(`The initial join error:\n${(error as Error).message}`)
          postMessage('callback false')
        })
        .finally(() => (joinInProgressRef.current = false))
    }
  }, [roomInfo])

  useEffect(() => {
    const onMessage = (message: string) => {
      switch (message) {
        case 'onEndCall':
          videoRoomRef.current.disconnect()
          setParticipants([])
          postMessage('dismount')
          break
      }
    }

    ;(window as unknown as InjectableWindow).NATIVE_MESSAGE_RECEIVER.on(onMessage)
    return () => (window as unknown as InjectableWindow).NATIVE_MESSAGE_RECEIVER.off(onMessage)
  }, [])

  return (
    <Grid container>
      <Grid size={12}>
        <pre>{debugLog}</pre>
      </Grid>
      {participants.map(participant => (
        <Grid key={participant.identity} size={6}>
          <WvParticipant room={videoRoomRef.current} participant={participant} />
        </Grid>
      ))}
    </Grid>
  )
}
