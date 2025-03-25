import express from 'express'
import userRoutes from './database/routes/users'
import contactsRoutes from './database/routes/contacts'
import lawOfficeRoutes from './database/routes/lawoffices'
import supabase from './database/supabase'

const app = express()
const port = 4000

app.use(express.json())

app.get('/test', async (req, res) => {
  res.json({ it: 'works' })
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

app.listen(port, () => {
  console.log('Hi.')
  console.log(`Server is running on http://localhost:${port}`)
})
