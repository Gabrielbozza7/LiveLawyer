import express from 'express'
import cors from 'cors'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import TwilioManager from './TwilioManager'
import { ClientToServerEvents, ServerToClientEvents } from './calls/SocketEventDefinitions'
import CallCenter from './calls/CallCenter'
import dotenv from 'dotenv'

const [BACKEND_IP, BACKEND_PORT] = getBackendVariables()

export function getBackendVariables(): [ip: string, port: string] {
  dotenv.config()
  let ip = process.env.BACKEND_IP
  let port = process.env.BACKEND_PORT
  if (ip === undefined) {
    console.log("WARNING: BACKEND_IP environment variable not set, defaulting to 'localhost'!")
    ip = 'localhost'
  }
  if (port === undefined) {
    console.log("WARNING: BACKEND_PORT environment variable not set, defaulting to '4000'!")
    port = '4000'
  }
  return [ip, port]
}

function getURL() {
  getBackendVariables()
  return `http://${BACKEND_IP}:${BACKEND_PORT}`
}

const URL = getURL()
// ^ This should be pulled from a shared configuration at some point.

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
  socket.on('joinAsClient', async (payload, callback) => {
    console.log(`Received joinAsClient event: {${socket.id}}`)
    const isParalegalAvailable = await callCenter.connectClient(socket)
<<<<<<< HEAD
    console.log(
      `isParalegalAvailable = {${isParalegalAvailable}}\nParalegal Available event: {${socket.id}}`,
    )
=======
    console.log(`Paralegal Available event: {${socket.id}}`)
>>>>>>> e29916c5dc13b9cddaddc3fc977fa3cc719f9697
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
<<<<<<< HEAD
  socket.on('summonLawyer', async (payload, callback) => {
=======
  socket.on('summonLawyer', async(payload, callback) => {
>>>>>>> e29916c5dc13b9cddaddc3fc977fa3cc719f9697
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
})

httpServer.listen(Number(BACKEND_PORT), '0.0.0.0', () => {
  console.log('Hi.')
  console.log(
    `Server is running on http://0.0.0.0:${BACKEND_PORT}, which should be accessible via ${URL}`,
  )
})
