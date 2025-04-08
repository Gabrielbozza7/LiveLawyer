import express from 'express'
import prisma from '../prisma'

const router = express.Router()

/**
 * Route which returns all Users in database table to allow for display on frontend
 */
router.get('/', async (req, res) => {
    try {
        const users = await prisma.user.findMany()
        res.json({ users })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Error Fetching Users' })
    }
})

/**
 * Route that allows for a creation of a user.
 * Usertype Param is not required since it is defaulted to Civilian upon creation.
 * ProfPicUrl param is also not required since it is optional for a user to have a profile pic.
 */
router.post('/', async (req, res) => {
    const { firstName, lastName, email, phoneNum, userType, profPicUrl } = req.body

    try {
        const newUser = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                phoneNum,
                userType,
                profPicUrl,
            },
        })
        res.status(201).json(newUser)
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: 'Failed to create user' })
    }
})

/**
 * Route that allows for a specific user in the Database Table to be updated.
 * Uses may include functionality where a user wants to update his own info.
 * Make sure row level security on the database allows for only a user to edit himself.
 */
router.put('/:id', async (req, res) => {
    const { id } = req.params
    const { firstName, lastName, phoneNum, userType, profPicUrl } = req.body

    try {
        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                firstName,
                lastName,
                phoneNum,
                userType,
                profPicUrl,
            },
        })
        res.json(updatedUser)
    } catch (err) {
        console.error(err)
        res.status(404).json({ error: 'User not found or update failed' })
    }
})


export default router
