'use client'
import { useState, useEffect, useRef } from 'react'
import { Participant } from 'twilio-video'
import TwilioParticipant from '../../components/TwilioParticipant'
import TwilioVideoRoom from '../../classes/TwilioVideoRoom'
import { io, Socket } from 'socket.io-client'
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from 'livelawyerlibrary/socket-event-definitions'
import { twilioIdentityToInfo, UserType } from 'livelawyerlibrary'
import {
  usePublicEnv,
  useSession,
  useSupabaseClient,
  useUserType,
} from 'livelawyerlibrary/context-manager'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

export function Call() {
  const env = usePublicEnv()
  const supabaseRef = useSupabaseClient()
  const sessionRef = useSession()
  const userType = useUserType()
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents>>(
    io(env.backendUrl, { autoConnect: false }),
  )
  const socketTokenRef = useRef<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const videoRoomRef = useRef<TwilioVideoRoom>(new TwilioVideoRoom())
  const [participants, setParticipants] = useState<Participant[]>([])
  const [clientParticipant, setClientParticipant] = useState<Participant | null>(null)
  const [observerParticipant, setObserverParticipant] = useState<Participant | null>(null)
  const [lawyerParticipant, setLawyerParticipant] = useState<Participant | null>(null)
  const [inQueueOrCall, setInQueueOrCall] = useState<boolean>(false)
  const [showToast, setShowToast] = useState<string | null>(null)
  const [hasLawyerInCall, setHasLawyerInCall] = useState<boolean>(false)
  const [permissionNotice, setPermissionNotice] = useState<string | null>(null)

  const onSendToRoom = async (
    { token, roomName }: { token: string; roomName: string },
    callback: (acknowledged: boolean) => void,
  ) => {
    try {
      await videoRoomRef.current.joinRoom(token, roomName)

      videoRoomRef.current.setupListeners(updatedParticipants => {
        setParticipants(updatedParticipants)
      })

      callback(true)
    } catch (err) {
      console.log('Error joining room:', err)
      alert('Unable to access webcam. Please check your browser settings and permissions.')
      callback(false)
    }
  }

  const onEndCall = () => {
    videoRoomRef.current.disconnect()
    setParticipants([])
    setHasLawyerInCall(false)
  }

  // Updating the corresponding participant slots when the participant(s) change(s):
  useEffect(() => {
    const foundUserTypes: Set<UserType> = new Set()
    participants.forEach(participant => {
      const userInfo = twilioIdentityToInfo(participant.identity)
      foundUserTypes.add(userInfo.userType)
      if (clientParticipant === null && userInfo.userType === 'Client') {
        setClientParticipant(participant)
      } else if (observerParticipant === null && userInfo.userType === 'Observer') {
        setObserverParticipant(participant)
      } else if (lawyerParticipant === null && userInfo.userType === 'Lawyer') {
        setLawyerParticipant(participant)
      }
    })
    if (!foundUserTypes.has('Client')) {
      setClientParticipant(null)
    }
    if (!foundUserTypes.has('Observer')) {
      setObserverParticipant(null)
    }
    if (!foundUserTypes.has('Lawyer')) {
      setLawyerParticipant(null)
    }
  }, [clientParticipant, lawyerParticipant, observerParticipant, participants])

  const onJoinQueueClick = async () => {
    if (socketRef.current.connected) {
      setShowToast('Your connection is already open! Try refreshing the page.')
      return
    }
    setLoading(true)
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
      setShowToast('Your browser or connection does not support camera and microphone access.')
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
      setShowToast('You must allow camera and microphone access to enter the queue.')
      setLoading(false)
      return
    } finally {
      setPermissionNotice(null)
    }
    socketRef.current.on('sendToRoom', onSendToRoom)
    socketRef.current.on('endCall', onEndCall)
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
      setShowToast('Your session is invalid! Try logging in again.')
      setLoading(false)
      return
    }
    socketTokenRef.current = authResult.socketToken
    const joinResult = await socketRef.current.emitWithAck('enqueue', {
      socketToken: socketTokenRef.current,
    })
    if (joinResult === 'INVALID_AUTH') {
      setShowToast('Your session is invalid! Try logging in again.')
    } else if (joinResult === 'ALREADY_IN_QUEUE') {
      setShowToast('You are already in the queue!')
      setInQueueOrCall(true)
    } else {
      setInQueueOrCall(true)
    }
    setLoading(false)
  }

  const onSummonLawyerClick = async () => {
    if (!socketRef.current.connected) {
      setShowToast('Your connection is broken!')
      return
    }
    setLoading(true)
    const summonResult = await socketRef.current.emitWithAck('summonLawyer', {
      socketToken: socketTokenRef.current,
    })
    if (summonResult === 'INVALID_AUTH') {
      setShowToast('Your session is invalid!')
    } else if (summonResult === 'NOT_IN_ROOM') {
      setShowToast('You are not in a room!')
    } else if (summonResult === 'NO_LAWYERS') {
      setShowToast('There are currently no lawyers available!')
    } else {
      setHasLawyerInCall(true)
    }
    setLoading(false)
  }

  const onExitQueueClick = async () => {
    if (!socketRef.current.connected) {
      setShowToast('Your connection is broken!')
      return
    }
    setLoading(true)
    const dequeueResult = await socketRef.current.emitWithAck('exitQueue', {
      socketToken: socketTokenRef.current,
    })
    if (dequeueResult === 'INVALID_AUTH') {
      setShowToast('Your login is invalid!')
    } else if (dequeueResult === 'NOT_IN_QUEUE' || dequeueResult === 'OK') {
      setInQueueOrCall(false)
      socketRef.current.disconnect()
    }
    setLoading(false)
  }

  const onEndCallClick = async () => {
    if (!socketRef.current.connected) {
      setShowToast('Your connection is broken!')
      return
    }
    setLoading(true)
    const hangUpResult = await socketRef.current.emitWithAck('hangUp', {
      socketToken: socketTokenRef.current,
    })
    if (hangUpResult === 'INVALID_AUTH') {
      setShowToast('Your login is invalid!')
    } else if (hangUpResult === 'NOT_IN_ROOM') {
      setShowToast('You are not in a room!')
    } else if (hangUpResult === 'CALL_ALREADY_ENDED') {
      setShowToast('The call already ended!')
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
      <title>Call</title>
      <Grid
        container
        alignItems="center"
        justifyContent="center"
        display="flex"
        sx={{ width: '100%' }}
        minHeight="85vh"
      >
        {!(userType === 'Observer' || userType === 'Lawyer') ? (
          <Card>
            <CardContent>
              <Typography>
                You must be either an observer or a lawyer to take calls on the website!
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <>
            {videoRoomRef.current.inARoom ? (
              <>
                <Grid size={4} justifyItems="center" alignItems="center">
                  {clientParticipant && (
                    <TwilioParticipant
                      room={videoRoomRef.current}
                      participant={clientParticipant}
                    />
                  )}
                </Grid>
                <Grid size={4} justifyItems="center" alignItems="center">
                  {observerParticipant && (
                    <TwilioParticipant
                      room={videoRoomRef.current}
                      participant={observerParticipant}
                    />
                  )}
                </Grid>
                <Grid size={4} justifyItems="center" alignItems="center">
                  {lawyerParticipant && (
                    <TwilioParticipant
                      room={videoRoomRef.current}
                      participant={lawyerParticipant}
                    />
                  )}
                </Grid>
                <Grid size={12}>
                  <Stack justifyContent="center" spacing={12} direction="row">
                    <Button
                      disabled={loading}
                      variant="contained"
                      color="warning"
                      onClick={onEndCallClick}
                    >
                      End Call
                    </Button>
                    {userType === 'Observer' && (
                      <Button
                        disabled={loading || hasLawyerInCall}
                        variant="contained"
                        color="success"
                        onClick={onSummonLawyerClick}
                      >
                        Summon Lawyer
                      </Button>
                    )}
                  </Stack>
                </Grid>
              </>
            ) : (
              <Grid size={4}>
                <Card>
                  <CardContent>
                    <Stack spacing={2} alignItems="center" direction="column">
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
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </>
        )}
      </Grid>
      <Snackbar
        open={showToast !== null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        autoHideDuration={3000}
        onClose={() => setShowToast(null)}
      >
        <Alert
          severity="error"
          variant="filled"
          sx={{ width: '100%' }}
          onClose={() => setShowToast(null)}
        >
          {showToast}
        </Alert>
      </Snackbar>
    </>
  )
}
