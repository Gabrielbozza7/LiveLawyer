import express from 'express'
import prisma from '../prisma'

const router = express.Router()

router.get('/', async (req, res) => {
    const offices = await prisma.lawOffice.findMany()
    const stringifyOffices = offices.map(office => ({
        ...office,
        id: office.id.toString(),
    }))
    res.json({ offices: stringifyOffices })
})

export default router