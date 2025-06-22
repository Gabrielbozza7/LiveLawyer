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
} from 'livelawyerlibrary/socket-event-definitions'
import { PublicEnv } from '@/classes/PublicEnv'
import { Session, SupabaseClient } from '@supabase/supabase-js'
import { Database } from 'livelawyerlibrary/database-types'
import { twilioIdentityToInfo, UserType } from 'livelawyerlibrary'

let socket: Socket<ServerToClientEvents, ClientToServerEvents>

export function Call({ env }: { env: PublicEnv }) {
  const supabaseRef = useRef<SupabaseClient<Database>>(null)
  const sessionRef = useRef<Session>(null)
  const [placeholder, setPlaceholder] = useState<string | undefined>('Loading...')
  const [userData, setUserData] = useState<Database['public']['Tables']['User']['Row']>()
  const videoRoomRef = useRef<TwilioVideoRoom>(new TwilioVideoRoom())
  const [participants, setParticipants] = useState<Participant[]>([])
  const [clientParticipant, setClientParticipant] = useState<Participant | null>(null)
  const [observerParticipant, setObserverParticipant] = useState<Participant | null>(null)
  const [lawyerParticipant, setLawyerParticipant] = useState<Participant | null>(null)
  const [inQueueOrCall, setInQueueOrCall] = useState<boolean>(false)
  const [showToast, setShowToast] = useState<string | null>(null)
  const [hasLawyerInCall, setHasLawyerInCall] = useState<boolean>(false)

  const sessionReadyCallback = async ({ supabase, session }: SessionReadyCallbackArg) => {
    supabaseRef.current = supabase
    sessionRef.current = session

    // Fetching data for the logged in user (if any):
    if (sessionRef.current !== null) {
      const { data, error } = await supabaseRef.current
        .from('User')
        .select()
        .eq('id', sessionRef.current.user.id)
        .single()
      if (error) {
        setShowToast('Something went wrong when trying to fetch your user data! Try again later.')
        return
      }
      setUserData(data)
      setPlaceholder(
        data.userType === 'Observer' || data.userType === 'Lawyer'
          ? undefined
          : 'You must be either an observer or a lawyer to take calls on the website',
      )
    } else {
      setPlaceholder('You must be logged in to use this page.')
    }
  }

  useEffect(() => {
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

    socket = io(env.backendUrl)
    socket.on('sendToRoom', onSendToRoom)
    socket.on('endCall', onEndCall)

    return () => {
      socket.off('sendToRoom', onSendToRoom)
      socket.off('endCall', onEndCall)
      socket.disconnect()
    }
  }, [env.backendUrl])

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

  return (
    <div>
      <title>Call</title>
      <LiveLawyerNav env={env} sessionReadyCallback={sessionReadyCallback} />
      <Container fluid="md" style={{ margin: 24 }}>
        {placeholder !== undefined ? (
          <Card>
            <Card.Body>{placeholder}</Card.Body>
          </Card>
        ) : userData !== undefined ? (
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
                  style={{ display: 'block' }}
                  variant="danger"
                  onClick={() => {
                    socket.emit('hangUp')
                  }}
                >
                  End Call
                </Button>
                <Button
                  style={{ display: 'block' }}
                  variant="success"
                  hidden={userData.userType === 'Lawyer'}
                  disabled={hasLawyerInCall}
                  onClick={async () => {
                    const isLawyerAvailable = await socket.emitWithAck('summonLawyer', null)
                    if (isLawyerAvailable) {
                      setHasLawyerInCall(true)
                    } else {
                      setShowToast('There are currently no lawyers available!')
                    }
                  }}
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
                      {userData.userType === 'Lawyer' ? 'an observer to summon you' : 'a client'}!
                    </Card.Text>
                    <Button
                      variant="danger"
                      type="submit"
                      onClick={async () => {
                        const didExitQueue = await socket.emitWithAck('dequeue', null)
                        if (didExitQueue) {
                          setInQueueOrCall(false)
                        }
                      }}
                    >
                      Leave Queue
                    </Button>
                  </Card.Body>
                ) : (
                  <Card.Body>
                    {(userData.userType === 'Observer' || userData.userType === 'Lawyer') && (
                      <Button
                        variant="primary"
                        type="submit"
                        onClick={async () => {
                          const queuedUserType = await socket.emitWithAck(
                            userData.userType === 'Observer' ? 'joinAsObserver' : 'joinAsLawyer',
                            {
                              userId: userData.id,
                              userSecret: 'abc', // temporary
                            },
                          )
                          if (queuedUserType === 'INVALID_AUTH') {
                            setShowToast('Your credentials are invalid!')
                          } else {
                            setInQueueOrCall(true)
                          }
                        }}
                      >
                        Join Queue as {userData.userType}
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
