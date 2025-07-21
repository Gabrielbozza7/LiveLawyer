'use client'
import TwilioVideoRoom from '@/classes/TwilioVideoRoom'
import TwilioParticipant from '@/components/TwilioParticipant'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { twilioIdentityToInfo, UserType } from 'livelawyerlibrary'
import { useEffect, useRef, useState } from 'react'
import { Participant } from 'twilio-video'

export interface RoomJoinData {
  token: string
  roomName: string
  callback: (acknowledged: boolean) => void
}

interface MobileWebViewCallProps {
  payload: string
}

export function MobileWebViewCall({ payload }: MobileWebViewCallProps) {
  const roomInfo = JSON.parse(atob(decodeURIComponent(payload))) as {
    token: string
    roomName: string
  }

  const videoRoomRef = useRef<TwilioVideoRoom>(new TwilioVideoRoom())
  const joinInProgressRef = useRef<boolean>(false)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [clientParticipant, setClientParticipant] = useState<Participant | null>(null)
  const [observerParticipant, setObserverParticipant] = useState<Participant | null>(null)
  const [lawyerParticipant, setLawyerParticipant] = useState<Participant | null>(null)

  // Connecting to call when component mounts:
  useEffect(() => {
    if (roomInfo !== undefined && !joinInProgressRef.current) {
      joinInProgressRef.current = true
      videoRoomRef.current
        .joinRoom(roomInfo.token, roomInfo.roomName)
        .then(() => {
          const [disconnectTrigger] = videoRoomRef.current.setupListeners(setParticipants)
          window.addEventListener('pagehide', disconnectTrigger)
          window.addEventListener('beforeunload', disconnectTrigger)
          eval(`window.ReactNativeWebView.postMessage('callback true')`)
        })
        .catch(error => {
          console.log('Error joining room:')
          console.error(error)
          eval(`window.ReactNativeWebView.postMessage('callback false')`)
        })
        .finally(() => (joinInProgressRef.current = false))
    }
  }, [roomInfo])

  useEffect(() => {
    const onHashChange = () => {
      const newHash = window.location.hash
      switch (newHash) {
        case 'onEndCall':
          videoRoomRef.current.disconnect()
          setParticipants([])
          break
      }
    }

    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

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

  return (
    <Grid container>
      <Grid size={12}>
        <Typography>{JSON.stringify(roomInfo)}</Typography>
      </Grid>
      <Grid size={6} justifyItems="center" alignItems="center">
        {clientParticipant && (
          <TwilioParticipant room={videoRoomRef.current} participant={clientParticipant} />
        )}
      </Grid>
      <Grid size={6} justifyItems="center" alignItems="center">
        {observerParticipant && (
          <TwilioParticipant room={videoRoomRef.current} participant={observerParticipant} />
        )}
      </Grid>
      <Grid size={6} justifyItems="center" alignItems="center">
        {lawyerParticipant && (
          <TwilioParticipant room={videoRoomRef.current} participant={lawyerParticipant} />
        )}
      </Grid>
    </Grid>
  )
}
