import fs from 'fs'
import express from 'express'
import cors from 'cors'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import TwilioManager from './TwilioManager'
import userRoutes from './database/routes/users'
import contactsRoutes from './database/routes/contacts'
import lawyerRoutes from './database/routes/lawyers'
import { supabase } from './database/supabase'
import CallCenter from './calls/CallCenter'
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from 'livelawyerlibrary/SocketEventDefinitions'
import { BACKEND_IP, BACKEND_PORT, BACKEND_URL } from 'livelawyerlibrary'
import { RECORDING_DIR_NAME } from './RecordingProcessor'

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
const callCenter: CallCenter = new CallCenter(twilioManager)

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
  socket.on('joinAsClient', async (payload, callback) => {
    console.log(`Received joinAsClient event: {${socket.id}}`)
    const isParalegalAvailable = await callCenter.connectClient(socket)
    console.log(`Paralegal Available event: {${socket.id}}`)
    callback(isParalegalAvailable)
  })
  socket.on('joinAsParalegal', (payload, callback) => {
    console.log(`Received joinAsParalegal event: {${socket.id}}`)
    const queuedUserType = callCenter.enqueueParalegal(socket)
    console.log(`queuedUserType = {${queuedUserType}}\nParalegal Available event: {${socket.id}}`)
    callback(queuedUserType)
  })
  socket.on('joinAsLawyer', (payload, callback) => {
    console.log(`Received joinAsLawyer event: {${socket.id}}`)
    const queuedUserType = callCenter.enqueueLawyer(socket)
    callback(queuedUserType)
  })
  socket.on('summonLawyer', async (payload, callback) => {
    console.log(`Received summonLawyer event: {${socket.id}}`)
    const isLawyerAvailable = await callCenter.pullLawyer(socket)
    callback(isLawyerAvailable)
  })
  socket.on('dequeue', (payload, callback) => {
    console.log(`Received dequeue event: {${socket.id}}`)
    const didExitQueue = callCenter.dequeueWorker(socket)
    callback(didExitQueue)
  })
  socket.on('hangUp', () => {
    console.log(`Received hangUp event: {${socket.id}}`)
    callCenter.handleHangUp(socket)
  })
  socket.on('disconnect', reason => {
    console.log(`User {${socket.id}} disconnected reason: ${reason}`)
  })

  socket.on('rejoinRoomAttempt', async (payload, callback) => {
    const { userId, userType } = payload
    console.log(`Received rejoinRoomAttempt from ${userType} {${userId}}, socket {${socket.id}}`)
    const room = callCenter.getRoomByUserId(userId)

    if (!room) {
      console.warn(`No previous room found for userId ${userId}`)
      callback(false)
      return
    }
    const token = twilioManager.getAccessToken(room.roomName)
    try {
      await socket.timeout(5000).emitWithAck('sendToRoom', { token, roomName: room.roomName })
      room.addConnectedParticipant(socket)
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

app.post('/signup', async (req, res) => {
  const { email, password } = req.body
  const { data, error } = await supabase.auth.signUp({ email: email, password: password })
  if (error) {
    res.status(400).json({ error: error.message })
    return
  }
  res.status(200).json(data)
})

app.post('/login', async (req, res) => {
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
