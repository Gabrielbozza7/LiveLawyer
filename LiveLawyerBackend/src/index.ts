import express from 'express'
import cors from 'cors'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import TwilioManager from './TwilioManager'
import userRoutes from './database/routes/users'
import contactsRoutes from './database/routes/contacts'
import lawOfficeRoutes from './database/routes/lawoffices'
import { supabase } from './database/supabase'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)
const twilioManager: TwilioManager = new TwilioManager()

const port = 4000
app.use(cors())
app.use(express.json())
twilioManager.setupPostRoute(app)

app.get('/test', async (req, res) => {
  res.status(200).json({ it: 'works' })
})

app.get('/', async (req, res) => {
  res.send('../LiveLawyerWeb/src/page.tsx')
})

io.on('connection', socket => {
  console.log(`a user connected with id ${socket.id}`)
  socket.join('testcall')
})

// DB routes
app.use('/users', userRoutes)
app.use('/contacts', contactsRoutes)
app.use('/lawOffices', lawOfficeRoutes)

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
  const { data, error } = await supabase.auth.signInWithPassword({ email: email, password: password })

  if (error) {
    res.status(400).json({ error: error.message })
    return
  }
  res.status(200).json(data)
})

httpServer.listen(port, '0.0.0.0', () => {
  console.log('Hi.')
  console.log(`Server is running on http://0.0.0.0:${port}`)
})
