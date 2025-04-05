'use client'
import 'bootstrap/dist/css/bootstrap.min.css'
import { useState, useEffect } from 'react'
import { Participant } from 'twilio-video'
import TwilioParticipant from '../../components/TwilioParticipant'
import TwilioVideoRoom from '../../classes/TwilioVideoRoom'
import { Button, Card, Container, Table, Toast } from 'react-bootstrap'
import LiveLawyerNav from '@/components/LiveLawyerNav'
import { socket } from '../socket'

export default function Call() {
  const [videoRoom] = useState<TwilioVideoRoom>(new TwilioVideoRoom())
  const [participants, setParticipants] = useState<Participant[]>([])
  const [inQueueOrCall, setInQueueOrCall] = useState<boolean>(false)
  const [isLawyer, setIsLawyer] = useState<boolean>(false)
  const [showToastNoLawyers, setShowToastNoLawyers] = useState<boolean>(false)
  const [hasLawyerInCall, setHasLawyerInCall] = useState<boolean>(false)

  useEffect(() => {
    const onSendToRoom = async ({ token, roomName }: { token: string; roomName: string }) => {
      await videoRoom.joinRoom(token, roomName)

      videoRoom.setupListeners(updatedParticipants => {
        setParticipants(updatedParticipants)
      })
    }

    const onNotifyQueueEntry = () => {
      setInQueueOrCall(true)
    }

    const onNotifyQueueExit = () => {
      setInQueueOrCall(false)
    }

    const onRejectFromNoLawyers = () => {
      setShowToastNoLawyers(true)
    }

    const onEndCall = () => {
      videoRoom.disconnect()
      setParticipants([])
    }

    socket.on('sendToRoom', onSendToRoom)
    socket.on('notifyQueueEntry', onNotifyQueueEntry)
    socket.on('notifyQueueExit', onNotifyQueueExit)
    socket.on('rejectFromNoLawyers', onRejectFromNoLawyers)
    socket.on('endCall', onEndCall)

    return () => {
      socket.off('sendToRoom', onSendToRoom)
      socket.off('notifyQueueEntry', onNotifyQueueEntry)
      socket.off('notifyQueueExit', onNotifyQueueExit)
      socket.off('rejectFromNoLawyers', onRejectFromNoLawyers)
      socket.off('endCall', onEndCall)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      <title>Call</title>
      <LiveLawyerNav />
      <Container fluid="md" style={{ margin: 24 }}>
        {videoRoom.inARoom ? (
          <div>
            <Table>
              <thead />
              <tbody>
                <tr>
                  {participants.map(participant => (
                    <td key={participant.identity}>
                      <TwilioParticipant room={videoRoom} participant={participant} />
                    </td>
                  ))}
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
              hidden={isLawyer}
              disabled={hasLawyerInCall}
              onClick={() => {
                socket.emit('summonLawyer')
                setHasLawyerInCall(true)
              }}
            >
              Summon Lawyer
            </Button>
            <Toast
              bg="danger"
              onClose={() => setShowToastNoLawyers(false)}
              show={showToastNoLawyers}
              delay={2500}
              autohide
            >
              <Toast.Header>
                <strong className="me-auto">Error</strong>
              </Toast.Header>
              <Toast.Body>There are currently no lawyers available!</Toast.Body>
            </Toast>
          </div>
        ) : (
          <Card>
            {inQueueOrCall ? (
              <Card.Body>
                <Card.Text>
                  You are now in the queue, waiting for a{' '}
                  {isLawyer ? 'paralegal to summon you' : 'client'}!
                </Card.Text>
                <Button
                  variant="danger"
                  type="submit"
                  onClick={() => {
                    socket.emit('dequeue')
                    setIsLawyer(false)
                  }}
                >
                  Leave Queue
                </Button>
              </Card.Body>
            ) : (
              <Card.Body>
                <Button
                  variant="primary"
                  type="submit"
                  onClick={() => {
                    socket.emit('joinAsParalegal', { userId: '12345' })
                    setIsLawyer(false)
                  }}
                >
                  Join Queue as Paralegal
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  onClick={() => {
                    socket.emit('joinAsLawyer', { userId: '12345' })
                    setIsLawyer(true)
                  }}
                >
                  Join Queue as Lawyer
                </Button>
              </Card.Body>
            )}
          </Card>
        )}
      </Container>
    </div>
  )
}
