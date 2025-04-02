'use client'
import 'bootstrap/dist/css/bootstrap.min.css'
import { useState, useEffect } from 'react'
import { Participant } from 'twilio-video'
import TwilioParticipant from '../../components/TwilioParticipant'
import TwilioVideoRoom from '../../classes/TwilioVideoRoom'
import { Button, Card, Container, Table } from 'react-bootstrap'
import LiveLawyerNav from '@/components/LiveLawyerNav'
import { socket } from '../socket'

export default function Call() {
  const [videoRoom] = useState<TwilioVideoRoom>(new TwilioVideoRoom())
  const [participants, setParticipants] = useState<Participant[]>([])
  const [inQueue, setInQueue] = useState<boolean>(false)

  useEffect(() => {
    const onSendToRoom = async ({ token, roomName }: { token: string; roomName: string }) => {
      await videoRoom.joinRoom(token, roomName)

      videoRoom.setupListeners(updatedParticipants => {
        setParticipants(updatedParticipants)
      })
    }

    const onNotifyParalegalQueueEntry = () => {
      setInQueue(true)
    }

    const onEndCall = () => {
      videoRoom.disconnect()
      setParticipants([])
    }

    socket.on('sendToRoom', onSendToRoom)
    socket.on('notifyParalegalQueueEntry', onNotifyParalegalQueueEntry)
    socket.on('endCall', onEndCall)

    return () => {
      socket.off('sendToRoom', onSendToRoom)
      socket.off('notifyParalegalQueueEntry', onNotifyParalegalQueueEntry)
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
              Disconnect
            </Button>
          </div>
        ) : (
          <Card>
            {inQueue ? (
              <Card.Body>
                <Card.Text>You are now in the queue, waiting for a client!</Card.Text>
              </Card.Body>
            ) : (
              <Card.Body>
                <Button
                  variant="primary"
                  type="submit"
                  onClick={() => {
                    socket.emit('joinAsParalegal', { userId: '12345' })
                  }}
                >
                  Join Queue
                </Button>
              </Card.Body>
            )}
          </Card>
        )}
      </Container>
    </div>
  )
}
