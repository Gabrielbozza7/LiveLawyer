'use client'
import 'bootstrap/dist/css/bootstrap.min.css'
import { useState, useEffect, useRef } from 'react'
import { Participant } from 'twilio-video'
import TwilioParticipant from '../../components/TwilioParticipant'
import TwilioVideoRoom from '../../classes/TwilioVideoRoom'
import { Button, Card, Container, Table, Toast } from 'react-bootstrap'
import LiveLawyerNav, { SessionReadyCallbackArg } from '@/components/LiveLawyerNav'
import { io, Socket } from 'socket.io-client'
import {
  ClientToServerEvents,
  Coordinates,
  ServerToClientEvents,
} from 'livelawyerlibrary/socket-event-definitions'
import { PublicEnv } from '@/classes/PublicEnv'
import { Session, SupabaseClient } from '@supabase/supabase-js'
import { Database } from 'livelawyerlibrary/database-types'
import { twilioIdentityToInfo, UserType } from 'livelawyerlibrary'

export function Call({ env }: { env: PublicEnv }) {
  const supabaseRef = useRef<SupabaseClient<Database>>(null)
  const sessionRef = useRef<Session>(null)
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents>>(
    io(env.backendUrl, { autoConnect: false }),
  )
  const socketTokenRef = useRef<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [placeholder, setPlaceholder] = useState<string | null>('Loading...')
  const [userType, setUserType] = useState<'Observer' | 'Lawyer' | null>(null)
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
  }

  const sessionReadyCallback = async ({ supabase, session }: SessionReadyCallbackArg) => {
    supabaseRef.current = supabase
    sessionRef.current = session

    // Fetching data for the logged in user (if any):
    if (sessionRef.current !== null) {
      const { data, error } = await supabaseRef.current
        .from('User')
        .select('userType')
        .eq('id', sessionRef.current.user.id)
        .single()
      if (error) {
        setPlaceholder('Something went wrong when trying to fetch your user data! Try again later.')
        return
      }
      if (!(data.userType === 'Observer' || data.userType === 'Lawyer')) {
        setPlaceholder('You must be either an observer or a lawyer to take calls on the website')
        return
      }
      setUserType(data.userType)
      setPlaceholder(null)
    } else {
      setPlaceholder('You must be logged in to use this page.')
    }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participants])

  const onJoinQueueClick = async () => {
    if (sessionRef.current === null) {
      setShowToast('Your session is invalid! Try logging in again.')
      return
    }
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
    let lawyerCoordinates: Coordinates | null = null
    if (userType === 'Lawyer') {
      if (navigator.geolocation) {
        setPermissionNotice(
          'Location access is necessary to route you to clients in the same state as you.',
        )
        let locationPromiseResolver: (success: boolean) => void = () => {}
        const locationPromise = new Promise<boolean>(resolve => {
          locationPromiseResolver = resolve
        })
        navigator.geolocation.getCurrentPosition(
          position => {
            lawyerCoordinates = { lat: position.coords.latitude, lon: position.coords.longitude }
            locationPromiseResolver(true)
          },
          () => {
            locationPromiseResolver(false)
          },
        )
        const allowed = await locationPromise
        setPermissionNotice(null)
        if (!allowed) {
          setShowToast('You must allow geolocation as a lawyer to enter the queue.')
          setLoading(false)
          return
        }
      } else {
        setShowToast('Your browser or connection does not support geolocation.')
        setLoading(false)
        return
      }
    }
    if (userType === 'Lawyer' && lawyerCoordinates === null) {
      setLoading(false)
      return
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
    const authResult = await socketRef.current.emitWithAck('authenticate', {
      accessToken: sessionRef.current.access_token,
      coordinates: lawyerCoordinates,
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
  }, [])

  return (
    <div>
      <title>Call</title>
      <LiveLawyerNav env={env} sessionReadyCallback={sessionReadyCallback} />
      <Container fluid="md" style={{ margin: 24 }}>
        {placeholder !== null ? (
          <Card>
            <Card.Body>{placeholder}</Card.Body>
          </Card>
        ) : userType !== null ? (
          <div>
            {videoRoomRef.current.inARoom ? (
              <div>
                <Table>
                  <thead />
                  <tbody>
                    <tr>
                      {clientParticipant && (
                        <td>
                          <TwilioParticipant
                            room={videoRoomRef.current}
                            participant={clientParticipant}
                          />
                        </td>
                      )}
                      {observerParticipant && (
                        <td>
                          <TwilioParticipant
                            room={videoRoomRef.current}
                            participant={observerParticipant}
                          />
                        </td>
                      )}
                      {lawyerParticipant && (
                        <td>
                          <TwilioParticipant
                            room={videoRoomRef.current}
                            participant={lawyerParticipant}
                          />
                        </td>
                      )}
                    </tr>
                  </tbody>
                </Table>
                <Button
                  disabled={loading}
                  style={{ display: 'block' }}
                  variant="danger"
                  onClick={onEndCallClick}
                >
                  End Call
                </Button>
                <Button
                  disabled={loading || hasLawyerInCall}
                  style={{ display: 'block' }}
                  variant="success"
                  hidden={userType === 'Lawyer'}
                  onClick={onSummonLawyerClick}
                >
                  Summon Lawyer
                </Button>
              </div>
            ) : (
              <Card>
                {inQueueOrCall ? (
                  <Card.Body>
                    <Card.Text>
                      You are now in the queue, waiting for{' '}
                      {userType === 'Lawyer' ? 'an observer to summon you' : 'a client'}!
                    </Card.Text>
                    <Button
                      disabled={loading}
                      variant="danger"
                      type="submit"
                      onClick={onExitQueueClick}
                    >
                      Exit Queue
                    </Button>
                  </Card.Body>
                ) : (
                  <Card.Body>
                    {userType !== null && (
                      <Button
                        disabled={loading}
                        variant="primary"
                        type="submit"
                        onClick={onJoinQueueClick}
                      >
                        Join Queue as {userType}
                      </Button>
                    )}
                    {permissionNotice && <Card.Text>{permissionNotice}</Card.Text>}
                  </Card.Body>
                )}
              </Card>
            )}
            <Toast
              bg="danger"
              onClose={() => setShowToast(null)}
              show={showToast !== null}
              delay={2500}
              autohide
            >
              <Toast.Header>
                <strong className="me-auto">Error</strong>
              </Toast.Header>
              <Toast.Body>{showToast}</Toast.Body>
            </Toast>
          </div>
        ) : (
          <></>
        )}
      </Container>
    </div>
  )
}
