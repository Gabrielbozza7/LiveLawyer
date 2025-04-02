import express from 'express'
import cors from 'cors'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import TwilioManager from './TwilioManager'
import { ClientToServerEvents, ServerToClientEvents } from './calls/SocketEventDefinitions'
import CallCenter from './calls/CallCenter'

const app = express()
const httpServer = createServer(app)
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  connectionStateRecovery: {},
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
})
const twilioManager: TwilioManager = new TwilioManager()
const callCenter: CallCenter = new CallCenter(twilioManager)

const port = 4000
app.use(cors())
app.use(express.json())
twilioManager.setupPostRoute(app)

app.get('/test', async (req, res) => {
  res.status(200).json({ it: 'works' })
})

io.on('connection', socket => {
  console.log(`User connected to socket: {${socket.id}}`)
  socket.on('joinAsClient', () => {
    callCenter.connectClient(socket)
  })
  socket.on('joinAsParalegal', () => {
    callCenter.enqueueParalegal(socket)
  })
})

httpServer.listen(port, '0.0.0.0', () => {
  console.log('Hi.')
  console.log(`Server is running on http://0.0.0.0:${port}`)
})
