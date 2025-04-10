import express from 'express'
import cors from 'cors'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import TwilioManager from './TwilioManager'
import CallCenter from './calls/CallCenter'
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from 'livelawyerlibrary/SocketEventDefinitions'
import { BACKEND_IP, BACKEND_PORT, BACKEND_URL } from 'livelawyerlibrary'

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

app.use(cors())
app.use(express.json())
twilioManager.setupPostRoute(app)

app.get('/test', async (req, res) => {
  res.status(200).json({ it: 'works' })
})

io.on('connection', socket => {
  console.log(`User connected to socket: {${socket.id}}`)
  socket.on('joinAsClient', (payload, callback) => {
    console.log(`Received joinAsClient event: {${socket.id}}`)
    const isParalegalAvailable = callCenter.connectClient(socket)
    callback(isParalegalAvailable)
  })
  socket.on('joinAsParalegal', (payload, callback) => {
    console.log(`Received joinAsParalegal event: {${socket.id}}`)
    const queuedUserType = callCenter.enqueueParalegal(socket)
    callback(queuedUserType)
  })
  socket.on('joinAsLawyer', (payload, callback) => {
    console.log(`Received joinAsLawyer event: {${socket.id}}`)
    const queuedUserType = callCenter.enqueueLawyer(socket)
    callback(queuedUserType)
  })
  socket.on('summonLawyer', (payload, callback) => {
    console.log(`Received summonLawyer event: {${socket.id}}`)
    const isLawyerAvailable = callCenter.pullLawyer(socket)
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
})

httpServer.listen(Number(BACKEND_PORT), '0.0.0.0', () => {
  console.log('Hi.')
  console.log(
    `Server is running on http://0.0.0.0:${BACKEND_PORT}, which should be accessible via ${BACKEND_URL}`,
  )
})
