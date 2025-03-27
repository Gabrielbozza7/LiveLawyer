'use client'
import 'bootstrap/dist/css/bootstrap.min.css'
import { useState, useCallback } from 'react'
import { Participant } from 'twilio-video'
import TwilioParticipant from '../../components/TwilioParticipant'
import TwilioVideoRoom from '../../classes/TwilioVideoRoom'
import { Button, Card, Container, Form, FormGroup, Table } from 'react-bootstrap'
import LiveLawyerNav from '@/components/LiveLawyerNav'

export default function Call() {
  const [videoRoom] = useState<TwilioVideoRoom>(new TwilioVideoRoom())
  const [participants, setParticipants] = useState<Participant[]>([])

  /// eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const [isConnected, setIsConnected] = useState(socket.connected);

  // useEffect(() => {
  //   function onConnect() {
  //     setIsConnected(true);
  //   }

  //   function onDisconnect() {
  //     setIsConnected(false);
  //   }

  //   socket.on('connect', onConnect);
  //   socket.on('disconnect', onDisconnect);

  //   return () => {
  //     socket.off('connect', onConnect);
  //     socket.off('disconnect', onDisconnect);
  //   };
  // }, []);

  const joinRoom = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      const formData = new FormData(event.currentTarget)
      const roomName = formData.get('room_name')!.toString()

      // prevent a page reload when a user submits the form
      event.preventDefault()

      await videoRoom.joinRoom(roomName)

      videoRoom.setupListeners(updatedParticipants => {
        setParticipants(updatedParticipants)
      })
    },
    [videoRoom],
  )

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
                videoRoom.disconnect()
                setParticipants([])
              }}
            >
              Disconnect
            </Button>
          </div>
        ) : (
          <div>
            <Card>
              <Card.Body>
                <Form id="room-name-form" onSubmit={joinRoom}>
                  <FormGroup>
                    <Form.Label>Enter a Room Name to join:</Form.Label>
                    <Form.Control name="room_name" id="room-name-input"></Form.Control>
                  </FormGroup>
                  <Button variant="primary" type="submit">
                    Join Room
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </div>
        )}
      </Container>
    </div>
  )
}
