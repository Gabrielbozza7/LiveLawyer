import TwilioVideoRoom from '@/classes/TwilioVideoRoom'
import TwilioParticipant from '@/components/TwilioParticipant'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import { twilioIdentityToInfo, UserType } from 'livelawyerlibrary'
import { useAlerter, useUserType } from 'livelawyerlibrary/context-manager'
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from 'livelawyerlibrary/socket-event-definitions'
import { Dispatch, RefObject, SetStateAction, useEffect, useRef, useState } from 'react'
import { Socket } from 'socket.io-client'
import { Participant } from 'twilio-video'

export interface RoomJoinData {
  token: string
  roomName: string
  callback: (acknowledged: boolean) => void
}

interface CallProps {
  loadingState: [boolean, Dispatch<SetStateAction<boolean>>]
  socketRef: RefObject<Socket<ServerToClientEvents, ClientToServerEvents>>
  socketTokenRef: RefObject<string>
  roomJoinDataState: [RoomJoinData | undefined, Dispatch<SetStateAction<RoomJoinData | undefined>>]
}

export function Call({
  loadingState: [loading, setLoading],
  socketRef,
  socketTokenRef,
  roomJoinDataState: [roomJoinData, setRoomJoinDataState],
}: CallProps) {
  const alerterRef = useAlerter()
  const userType = useUserType()
  const videoRoomRef = useRef<TwilioVideoRoom>(new TwilioVideoRoom())
  const joinInProgressRef = useRef<boolean>(false)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [clientParticipant, setClientParticipant] = useState<Participant | null>(null)
  const [observerParticipant, setObserverParticipant] = useState<Participant | null>(null)
  const [lawyerParticipant, setLawyerParticipant] = useState<Participant | null>(null)
  const [hasLawyerInCall, setHasLawyerInCall] = useState<boolean>(false)

  useEffect(() => {
    if (roomJoinData !== undefined && !joinInProgressRef.current) {
      joinInProgressRef.current = true
      videoRoomRef.current
        .joinRoom(roomJoinData.token, roomJoinData.roomName)
        .then(() => {
          const [disconnectTrigger] = videoRoomRef.current.setupListeners(setParticipants)
          window.addEventListener('pagehide', disconnectTrigger)
          window.addEventListener('beforeunload', disconnectTrigger)

          roomJoinData.callback(true)
        })
        .catch(error => {
          console.log('Error joining room:')
          console.error(error)
          roomJoinData.callback(false)
        })
        .finally(() => (joinInProgressRef.current = false))
    }
  }, [roomJoinData])

  useEffect(() => {
    const onEndCall = () => {
      videoRoomRef.current.disconnect()
      setParticipants([])
      setHasLawyerInCall(false)
      setRoomJoinDataState(undefined)
    }

    const socket = socketRef.current
    socket.on('endCall', onEndCall)
    return () => {
      socket.off('endCall', onEndCall)
    }
  }, [setRoomJoinDataState, socketRef])

  const onSummonLawyerClick = async () => {
    if (!socketRef.current.connected) {
      alerterRef.current.error('Your connection is broken!')
      return
    }
    setLoading(true)
    const summonResult = await socketRef.current.emitWithAck('summonLawyer', {
      socketToken: socketTokenRef.current,
    })
    if (summonResult === 'INVALID_AUTH') {
      alerterRef.current.error('Your session is invalid!')
    } else if (summonResult === 'NOT_IN_ROOM') {
      alerterRef.current.error('You are not in a room!')
    } else if (summonResult === 'NO_LAWYERS') {
      alerterRef.current.error('There are currently no lawyers available!')
    } else {
      setHasLawyerInCall(true)
    }
    setLoading(false)
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

  const onEndCallClick = async () => {
    if (!socketRef.current.connected) {
      alerterRef.current.error('Your connection is broken!')
      return
    }
    setLoading(true)
    const hangUpResult = await socketRef.current.emitWithAck('hangUp', {
      socketToken: socketTokenRef.current,
    })
    if (hangUpResult === 'INVALID_AUTH') {
      alerterRef.current.error('Your login is invalid!')
    } else if (hangUpResult === 'NOT_IN_ROOM') {
      alerterRef.current.error('You are not in a room!')
    } else if (hangUpResult === 'CALL_ALREADY_ENDED') {
      alerterRef.current.error('The call already ended!')
    }
    setLoading(false)
  }

  return (
    <>
      <Grid size={4} justifyItems="center" alignItems="center">
        {clientParticipant && (
          <TwilioParticipant room={videoRoomRef.current} participant={clientParticipant} />
        )}
      </Grid>
      <Grid size={4} justifyItems="center" alignItems="center">
        {observerParticipant && (
          <TwilioParticipant room={videoRoomRef.current} participant={observerParticipant} />
        )}
      </Grid>
      <Grid size={4} justifyItems="center" alignItems="center">
        {lawyerParticipant && (
          <TwilioParticipant room={videoRoomRef.current} participant={lawyerParticipant} />
        )}
      </Grid>
      <Grid size={12}>
        <Stack justifyContent="center" spacing={12} direction="row">
          <Button disabled={loading} variant="contained" color="warning" onClick={onEndCallClick}>
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
  )
}
