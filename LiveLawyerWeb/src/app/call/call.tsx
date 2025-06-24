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
  ServerToClientEvents,
  SocketResult,
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
    })
    if (authResult === 'INVALID_AUTH') {
      setShowToast('Your session is invalid! Try logging in again.')
      setLoading(false)
      return
    }
    let joinResult: SocketResult | 'NO_STATE'
    if (userType === 'Observer') {
      joinResult = await socketRef.current.emitWithAck('joinAsObserver', null)
    } else if (userType === 'Lawyer') {
      joinResult = await socketRef.current.emitWithAck('joinAsLawyer', {
        coordinates: { lat: 1, lon: 1 },
      })
    } else {
      joinResult = 'INVALID_AUTH'
    }
    if (joinResult === 'INVALID_AUTH') {
      setShowToast('Your credentials are invalid!')
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
    const summonResult = await socketRef.current.emitWithAck('summonLawyer', null)
    if (summonResult === 'OK') {
      setHasLawyerInCall(true)
    } else if (summonResult === 'NO_LAWYERS') {
      setShowToast('There are currently no lawyers available!')
    } else {
      setShowToast('Your session is invalid!')
    }
    setLoading(false)
  }

  const onExitQueueClick = async () => {
    if (!socketRef.current.connected) {
      setShowToast('Your connection is broken!')
      return
    }
    setLoading(true)
    const dequeueResult = await socketRef.current.emitWithAck('dequeue', null)
    if (dequeueResult === 'NOT_IN_QUEUE' || dequeueResult === 'OK') {
      setInQueueOrCall(false)
    }
    socketRef.current.disconnect()
    setLoading(false)
  }

  const onEndCallClick = () => {
    if (!socketRef.current.connected) {
      setShowToast('Your connection is broken!')
      return
    }
    socketRef.current.emit('hangUp')
  }

  useEffect(() => {
    const socket = socketRef.current
    return () => {
      console.log('pre-destruct ' + socket.connected)
      socket.disconnect()
      console.log('post-destruct ' + socket.connected)
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
