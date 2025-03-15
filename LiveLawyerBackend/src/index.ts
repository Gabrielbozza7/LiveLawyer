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
  .from('users')
  .select('*')
    res.send(data)
  } catch (error) {
    res.send(error)
  }
})

app.listen(port, () => {
  console.log('Hi.')
  console.log(`Server is running on http://localhost:${port}`)
})
