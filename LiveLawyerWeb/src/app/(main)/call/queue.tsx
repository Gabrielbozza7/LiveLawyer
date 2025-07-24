'use client'
import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from 'livelawyerlibrary/socket-event-definitions'
import {
  useAlerter,
  usePublicEnv,
  useSession,
  useSupabaseClient,
  useUserType,
} from 'livelawyerlibrary/context-manager'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { Call, RoomJoinData } from './call'
import { PageContent } from '@/components/ui/page-content'

export function Queue() {
  const env = usePublicEnv()
  const alerterRef = useAlerter()
  const supabaseRef = useSupabaseClient()
  const sessionRef = useSession()
  const userType = useUserType()
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents>>(
    io(env.websiteUrl, {
      path: '/api/backend/socket',
      addTrailingSlash: false,
      autoConnect: false,
    }),
  )
  const socketTokenRef = useRef<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [inQueueOrCall, setInQueueOrCall] = useState<boolean>(false)
  const [permissionNotice, setPermissionNotice] = useState<string | null>(null)
  const [roomJoinData, setRoomJoinData] = useState<RoomJoinData | undefined>(undefined)

  const onSendToRoom = async (
    { token, roomName }: { token: string; roomName: string },
    callback: (acknowledged: boolean) => void,
  ) => {
    setRoomJoinData({ token, roomName, callback })
  }

  const onJoinQueueClick = async () => {
    if (socketRef.current.connected) {
      alerterRef.current.error('Your connection is already open! Try refreshing the page.')
      return
    }
    setLoading(true)
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
      alerterRef.current.error(
        'Your browser or connection does not support camera and microphone access.',
      )
      setLoading(false)
      return
    }
    try {
      setPermissionNotice('Camera/microphone access is necessary to participate in video calls.')
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      const tracks = stream.getTracks()
      tracks.forEach(track => {
        track.stop()
      })
    } catch {
      alerterRef.current.error('You must allow camera and microphone access to enter the queue.')
      setLoading(false)
      return
    } finally {
      setPermissionNotice(null)
    }
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
    const accessToken = sessionRef.current.access_token
    const authResult = await socketRef.current.emitWithAck('authenticate', {
      accessToken,
      coordinates: null,
    })
    if (authResult.result === 'INVALID_AUTH') {
      alerterRef.current.error('Your session is invalid! Try logging in again.')
      setLoading(false)
      return
    }
    socketTokenRef.current = authResult.socketToken
    const joinResult = await socketRef.current.emitWithAck('enqueue', {
      socketToken: socketTokenRef.current,
    })
    if (joinResult === 'INVALID_AUTH') {
      alerterRef.current.error('Your session is invalid! Try logging in again.')
    } else if (joinResult === 'ALREADY_IN_QUEUE') {
      alerterRef.current.error('You are already in the queue!')
      setInQueueOrCall(true)
    } else {
      setInQueueOrCall(true)
    }
    setLoading(false)
  }

  const onExitQueueClick = async () => {
    if (!socketRef.current.connected) {
      alerterRef.current.error('Your connection is broken!')
      return
    }
    setLoading(true)
    const dequeueResult = await socketRef.current.emitWithAck('exitQueue', {
      socketToken: socketTokenRef.current,
    })
    if (dequeueResult === 'INVALID_AUTH') {
      alerterRef.current.error('Your login is invalid!')
    } else if (dequeueResult === 'NOT_IN_QUEUE' || dequeueResult === 'OK') {
      setInQueueOrCall(false)
      socketRef.current.disconnect()
    }
    setLoading(false)
  }

  useEffect(() => {
    const socket = socketRef.current
    return () => {
      socket.disconnect()
    }
  }, [sessionRef, supabaseRef])

  return (
    <>
      {!(userType === 'Observer' || userType === 'Lawyer') ? (
        <PageContent title="Blocked Page">
          <Typography>
            You must be either an observer or a lawyer to take calls on the website!
          </Typography>
        </PageContent>
      ) : roomJoinData !== undefined ? (
        <Call
          loadingState={[loading, setLoading]}
          socketRef={socketRef}
          socketTokenRef={socketTokenRef}
          roomJoinDataState={[roomJoinData, setRoomJoinData]}
        />
      ) : (
        <PageContent title="Video Call Queue" alignItems="center">
          {inQueueOrCall ? (
            <>
              <Typography>
                You are now in the queue, waiting for{' '}
                {userType === 'Lawyer' ? 'an observer to summon you' : 'a client'}!
              </Typography>
              <Button
                disabled={loading}
                variant="contained"
                color="warning"
                onClick={onExitQueueClick}
              >
                Exit Queue
              </Button>
            </>
          ) : (
            <>
              {userType !== null && (
                <Button
                  disabled={loading}
                  variant="contained"
                  color="primary"
                  onClick={onJoinQueueClick}
                >
                  Join Queue as {userType}
                </Button>
              )}
              {permissionNotice && <Typography>{permissionNotice}</Typography>}
            </>
          )}
        </PageContent>
      )}
    </>
  )
}
