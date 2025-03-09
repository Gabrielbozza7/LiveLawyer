import express from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import TwilioManager from './TwilioManager'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)
const twilioManager: TwilioManager = new TwilioManager()

const port = 4000
app.use(express.json())
twilioManager.setupPostRoute(app)

app.get('/test', async (req, res) => {
  res.json({ it: 'works' })
})

app.get('/', async (req, res) => {
  res.send('../LiveLawyerWeb/src/page.tsx',
  )
})

io.on('connection', socket => {
  console.log(`a user connected with id ${socket.id}`)
  socket.join('testcall')
})

httpServer.listen(port, () => {
  console.log('Hi.')
  console.log(`Server is running on http://localhost:${port}`)
})
