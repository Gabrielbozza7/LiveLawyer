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
  socket.on('joinAsClient', () => {
    console.log(`Received joinAsClient event: {${socket.id}}`)
    callCenter.connectClient(socket)
  })
  socket.on('joinAsParalegal', () => {
    console.log(`Received joinAsParalegal event: {${socket.id}}`)
    callCenter.enqueueParalegal(socket)
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
