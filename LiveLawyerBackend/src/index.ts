import express from 'express'
import {supabase} from './database/supabase'

const app = express()
const port = 4000
app.use(express.json())

app.get('/test', async (req, res) => {
  res.json({ it: 'works' })
})

app.get('/database', async (req, res) => {
  try {  
  let { data, error } = await supabase
  .from('user')
  .select('*')
    res.header("Access-Control-Allow-Origin", "*")
    res.json(data)
    console.log(`Database accessed by: ${req.ip}`)
  } catch (error) {
    res.send(error)
  }
})

app.post('/signup', async (req, res) => {
  const { email, password } = req.body
  const { data, error } = await supabase.auth.signUp({email: email, password: password})
  if (error) {
    res.status(400).json({ error: error.message })
    return
  }
  res.status(200).json(data)
})

app.post('/login', async (req, res) => {
  const { email, password } = req.body
  const { data, error } = await supabase.auth.signInWithPassword({email: email, password: password})

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
