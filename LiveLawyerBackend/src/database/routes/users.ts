import express from 'express'
import prisma from '../prisma'

const router = express.Router()

router.get('/', async (req, res) => {
    const users = await prisma.user.findMany()
    const stringifyUsers = users.map(user => ({
        ...user,
        id: user.id.toString(),
    }))
    res.json({ users: stringifyUsers })
})

export default router
