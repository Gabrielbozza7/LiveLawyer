"use client"
import React, { useState, useEffect, useRef, useCallback} from 'react';
import { socket } from './socket';
import {startRoom} from './public/roomConnect';

export default function App() {
  const formRef = useRef(null);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  const startRoomIntermediate = useCallback((event: React.FormEvent<HTMLFormElement>)=>{
    startRoom(event,formRef.current!,containerRef.current!)
  },[])

  return(
      <div>
      <div>
        <title>Live Lawyer</title>
        {/* Twilio Video CDN */}
        <script src="https://sdk.twilio.com/js/video/releases/2.15.2/twilio-video.min.js"></script>
      </div>
      <div>
        <form id="room-name-form" ref={formRef} onSubmit={() => {startRoomIntermediate}}>
          Enter a Room Name to join: <input ref={inputRef} name="room_name" id="room-name-input" />
          <button type="submit">Join Room</button>
        </form>
        <div id="video-container"ref={containerRef}></div>
        <script src="public/main.js"></script>
      </div>

    </div>

    )
    
}
