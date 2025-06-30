import fs from 'fs'
import express from 'express'
import cors from 'cors'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import TwilioManager from './TwilioManager'
import callHistoryRoutes from './routes/call-history'
import lawOfficeRoutes from './routes/law-office'
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
import { ROUTER_LAW_OFFICE } from 'livelawyerlibrary/api/types/law-office'

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
      console.log(`Received 'authenticate' event from socket {${socket.id}}`)
      const authenticationResult = await identityMap.register(
        socket,
        payload.accessToken,
        payload.coordinates,
      )
      if (authenticationResult === false) {
        callback({ result: 'INVALID_AUTH' })
      } else {
        callback({ result: 'OK', socketToken: authenticationResult })
      }
    })
    socket.on('joinAsClient', async (payload, callback) => {
      const user = identityMap.userFromSocketWithToken(socket, payload.socketToken)
      if (user === undefined || user.type !== 'Client') {
        callback('INVALID_AUTH')
        return
      }
      console.log(`Received 'joinAsClient' event from user ${user.id}`)
      const response = await callCenter.joinAsClient(user)
      callback(response)
    })
    socket.on('enqueue', (payload, callback) => {
      const user = identityMap.userFromSocketWithToken(socket, payload.socketToken)
      if (user === undefined || user.type === 'Client') {
        callback('INVALID_AUTH')
        return
      }
      console.log(`Received 'enqueue' event from user ${user.id}`)
      const response = callCenter.enqueue(user)
      callback(response)
    })
    socket.on('exitQueue', (payload, callback) => {
      const user = identityMap.userFromSocketWithToken(socket, payload.socketToken)
      if (user === undefined || user.type === 'Client') {
        callback('INVALID_AUTH')
        return
      }
      console.log(`Received 'exitQueue' event from user ${user.id}`)
      const response = callCenter.exitQueue(user)
      callback(response)
    })
    socket.on('summonLawyer', async (payload, callback) => {
      const user = identityMap.userFromSocketWithToken(socket, payload.socketToken)
      if (user === undefined || user.type !== 'Observer') {
        callback('INVALID_AUTH')
        return
      }
      console.log(`Received 'summonLawyer' event from user ${user.id}`)
      const response = await callCenter.summonLawyer(user)
      callback(response)
    })
    socket.on('hangUp', (payload, callback) => {
      const user = identityMap.userFromSocketWithToken(socket, payload.socketToken)
      if (user === undefined) {
        callback('INVALID_AUTH')
        return
      }
      console.log(`Received 'hangUp' event from user ${user.id}`)
      const response = callCenter.hangUp(user)
      callback(response)
    })
    socket.on('disconnect', reason => {
      const userId = identityMap.remove(socket)
      if (userId !== false) {
        console.log(`Disconnected from user ${userId} with reason: ${reason}`)
      }
    })
    socket.on('rejoinRoomAttempt', async (payload, callback) => {
      const user = identityMap.userFromSocketWithToken(socket, payload.socketToken)
      if (user === undefined) {
        callback(false)
        return
      }
      // NOTE: THIS HANDLER IS COMPLETELY UNTESTED BECAUSE THERE IS NO WAY TO FIRE THIS EVENT FROM A CLIENT YET
      console.log(`Received 'rejoinRoomAttempt' event from user ${user.id}`)

      if (user.room === null) {
        console.warn(`No previous room found for user ${user.id}`)
        callback(false)
        return
      }
      const token = await twilioManager.getAccessToken(user.room, user.type, user.id)
      try {
        await socket
          .timeout(5000)
          .emitWithAck('sendToRoom', { token, roomName: user.room.roomName })
        await user.room.connectParticipant(user, token, 5000)
        callback(true)
        console.log(`User ${user.id} successfully rejoined room ${user.room.roomName}`)
      } catch (err) {
        console.error(`Failed to rejoin user ${user.id}:`, err)
        callback(false)
      }
    })
  })

  // DB routes
  app.use(ROUTER_LAW_OFFICE, lawOfficeRoutes)
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
