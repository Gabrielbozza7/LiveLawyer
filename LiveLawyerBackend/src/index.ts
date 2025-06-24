import fs from 'fs'
import express from 'express'
import cors from 'cors'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import TwilioManager from './TwilioManager'
import userRoutes from './database/routes/users'
import contactsRoutes from './database/routes/contacts'
import lawyerRoutes from './database/routes/lawyers'
import callHistoryRoutes from './database/routes/call-history'
import CallCenter from './calls/CallCenter'
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from 'livelawyerlibrary/socket-event-definitions'
import { BACKEND_IP, BACKEND_PORT, BACKEND_URL } from 'livelawyerlibrary/env'
import { RECORDING_DIR_NAME } from './RecordingProcessor'
import IdentityMap from './IdentityMap'
import { getSupabaseClient } from './database/supabase'
import { ROUTER_CALL_HISTORY } from 'livelawyerlibrary/api/types/call-history'
import { loadGeolocationFunction } from './coord2state'

async function main() {
  await loadGeolocationFunction()

  const app = express()
  const httpServer = createServer(app)
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    connectionStateRecovery: {},
    cors: {
      origin: ['http://localhost:3000', `http://${BACKEND_IP}:3000`, 'http://localhost:8081'],
      methods: ['GET', 'POST'],
    },
  })
  const twilioManager: TwilioManager = new TwilioManager()
  const identityMap: IdentityMap = new IdentityMap()
  const callCenter: CallCenter = new CallCenter(twilioManager, identityMap)

  if (!fs.existsSync(RECORDING_DIR_NAME)) {
    fs.mkdirSync(RECORDING_DIR_NAME)
  }

  app.use(cors())
  app.use(express.json())

  app.get('/test', async (req, res) => {
    res.status(200).json({ it: 'works' })
  })

  io.on('connection', socket => {
    console.log(`User connected to socket: {${socket.id}}`)
    socket.on('authenticate', async (payload, callback) => {
      console.log(`Received authenticate event: {${socket.id}}`)
      const authenticationResult = await identityMap.register(socket, payload.accessToken)
      if (authenticationResult === false) {
        callback('INVALID_AUTH')
      } else {
        callback('OK')
      }
    })
    socket.on('joinAsClient', async (payload, callback) => {
      let userId = identityMap.userIdOf(socket)
      if (userId === undefined) {
        callback('INVALID_AUTH')
        return
      }
      console.log(`Received joinAsClient event from user ${userId}`)
      const isObserverAvailable = await callCenter.connectClient(
        socket,
        userId,
        payload.coordinates,
      )
      callback(isObserverAvailable ? 'OK' : 'NO_OBSERVERS')
    })
    socket.on('joinAsObserver', async (payload, callback) => {
      let userId = identityMap.userIdOf(socket)
      if (userId === undefined) {
        callback('INVALID_AUTH')
        return
      }
      console.log(`Received joinAsObserver event from user ${userId}`)
      const supabase = await getSupabaseClient()
      const { data, error } = await supabase.from('User').select().eq('id', userId).single()
      if (error) {
        console.log('Error when trying to determine whether a user is actually an observer:')
        console.error(error)
        callback('INVALID_AUTH')
        return
      }
      if (data === null || data.userType !== 'Observer') {
        callback('INVALID_AUTH')
        return
      }
      callCenter.enqueueObserver(socket)
      callback('OK')
    })
    socket.on('joinAsLawyer', async (payload, callback) => {
      let userId = identityMap.userIdOf(socket)
      if (userId === undefined) {
        callback('INVALID_AUTH')
        return
      }
      console.log(`Received joinAsLawyer event from user: {${userId}}`)
      const supabase = await getSupabaseClient()
      const { data, error } = await supabase.from('User').select().eq('id', userId).single()
      if (error) {
        console.log('Error when trying to determine whether a user is actually a lawyer:')
        console.error(error)
        callback('INVALID_AUTH')
        return
      }
      if (data === null || data.userType !== 'Observer') {
        callback('INVALID_AUTH')
        return
      }
      callCenter.enqueueLawyer(socket)
      callback('OK')
    })
    socket.on('summonLawyer', async (payload, callback) => {
      let userId = identityMap.userIdOf(socket)
      if (userId === undefined) {
        callback('INVALID_AUTH')
        return
      }
      // TODO: ADD OBSERVER CHECK
      console.log(`Received summonLawyer event from user ${userId}`)
      const isLawyerAvailable = await callCenter.pullLawyer(socket)
      callback(isLawyerAvailable ? 'OK' : 'NO_LAWYERS')
    })
    socket.on('dequeue', (payload, callback) => {
      let userId = identityMap.userIdOf(socket)
      if (userId === undefined) {
        callback('INVALID_AUTH')
        return
      }
      console.log(`Received dequeue event from user ${userId}`)
      const didExitQueue = callCenter.dequeueWorker(socket)
      callback(didExitQueue ? 'OK' : 'NOT_IN_QUEUE')
    })
    socket.on('hangUp', () => {
      // TODO: REFACTOR WITH ACK
      console.log(`Received hangUp event: {${socket.id}}`)
      callCenter.handleHangUp(socket)
    })
    socket.on('disconnect', reason => {
      const userId = identityMap.remove(socket)
      if (userId !== false) {
        console.log(`Disconnected from user ${socket.id} with reason: ${reason}`)
      }
    })
    socket.on('rejoinRoomAttempt', async (payload, callback) => {
      // NOTE: THIS HANDLER IS COMPLETELY UNTESTED BECAUSE THERE IS NO WAY TO FIRE THIS EVENT FROM A CLIENT YET
      const { userId, userType } = payload
      console.log(`Received rejoinRoomAttempt from ${userType} {${userId}}, socket {${socket.id}}`)
      const room = callCenter.getRoomByUserId(userId)

      if (!room) {
        console.warn(`No previous room found for userId ${userId}`)
        callback(false)
        return
      }
      const token = await twilioManager.getAccessToken(room, userType, userId)
      try {
        await socket.timeout(5000).emitWithAck('sendToRoom', { token, roomName: room.roomName })
        await room.connectParticipant(socket, token, 5000)
        callback(true)
        console.log(`User ${userId} successfully rejoined room ${room.roomName}`)
      } catch (err) {
        console.error(`Failed to rejoin user ${userId}:`, err)
        callback(false)
      }
    })
  })

  // DB routes
  app.use('/users', userRoutes)
  app.use('/contacts', contactsRoutes)
  app.use('/lawyers', lawyerRoutes)

  app.use(ROUTER_CALL_HISTORY, callHistoryRoutes)

  app.post('/signup', async (req, res) => {
    const supabase = await getSupabaseClient()
    const { email, password } = req.body
    const { data, error } = await supabase.auth.signUp({ email: email, password: password })
    if (error) {
      res.status(400).json({ error: error.message })
      return
    }
    res.status(200).json(data)
  })

  app.post('/login', async (req, res) => {
    const supabase = await getSupabaseClient()
    const { email, password } = req.body
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) {
      res.status(400).json({ error: error.message })
      return
    }
    res.status(200).json(data)
  })

  httpServer.listen(Number(BACKEND_PORT), '0.0.0.0', () => {
    console.log('Hi.')
    console.log(
      `Server is running on http://0.0.0.0:${BACKEND_PORT}, which should be accessible via ${BACKEND_URL}`,
    )
  })
}

main()
