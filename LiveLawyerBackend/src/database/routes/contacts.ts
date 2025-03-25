import express from 'express'
import prisma from '../prisma'

const router = express.Router()

router.get('/', async (req, res) => {
    const contacts = await prisma.contact.findMany()
    const stringifyContacts = contacts.map(contact => ({
        ...contact,
        id: contact.id.toString(),
    }))
    res.json({ contacts: stringifyContacts })
})

export default router