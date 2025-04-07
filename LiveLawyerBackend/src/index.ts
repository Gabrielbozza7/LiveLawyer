import express from 'express'
import userRoutes from './database/routes/users'
import contactsRoutes from './database/routes/contacts'
import lawOfficeRoutes from './database/routes/lawoffices'

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

app.listen(port, () => {
  console.log('Hi.')
  console.log(`Server is running on http://localhost:${port}`)
})
