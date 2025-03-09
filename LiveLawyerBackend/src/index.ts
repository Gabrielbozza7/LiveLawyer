import express from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)

const port = 4000
app.use(express.json())

app.get('/test', async (req, res) => {
  res.json({ it: 'works' })
})

app.get('/', async (req, res) => {
  res.send(
    '<!DOCTYPE html><html><body><script src="/socket.io/socket.io.js"></script><script>const socket = io();</script></body></html>',
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
