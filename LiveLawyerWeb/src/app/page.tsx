'use client'
import React, { useState, useCallback } from 'react'
// import { socket } from './socket';
import TwilioVideoRoom from './public/TwilioVideoRoom'
import { Participant } from 'twilio-video'
import TwilioParticipant from './public/TwilioParticipant'

export default function App() {
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
      <div>
        <title>Live Lawyer</title>
      </div>
      <div>
        {videoRoom.inARoom ? (
          <div>
            {participants.map(participant => (
              <TwilioParticipant
                key={participant.identity}
                room={videoRoom}
                participant={participant}
              />
            ))}
            <button
              onClick={() => {
                videoRoom.disconnect()
                setParticipants([])
              }}
            >
              Disconnect
            </button>
          </div>
        ) : (
          <form id="room-name-form" onSubmit={joinRoom}>
            Enter a Room Name to join:
            <input name="room_name" id="room-name-input" />
            <button type="submit">Join Room</button>
          </form>
        )}
      </div>
    </div>
  )
}
