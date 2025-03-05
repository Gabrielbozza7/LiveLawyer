import express from 'express'

const app = express()
const port = 4000
app.use(express.json())

app.get('/test', async (req, res) => {
  res.json({ it: 'works' })
})

app.listen(port, () => {
  console.log('Hi.')
  console.log(`Server is running on http://localhost:${port}`)
})
