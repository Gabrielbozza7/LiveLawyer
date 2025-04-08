import express from 'express'
import prisma from '../prisma'

const router = express.Router()

/**
 * GET ALL.
 * Route: GET /users
 * Fetch all users.
 */
router.get('/', async (req, res) => {
    try {
        const users = await prisma.user.findMany()
        res.status(200).json({ message: 'Succesfully Fetched Users', users })
        //console.log(users)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error Fetching Users' })
    }
})

/**
 * GET ONE.
 * Route: GET /users/:id
 * Fetches one user.
 */
router.get('/:id', async (req, res) => {
    const { id } = req.params
    try {
        const user = await prisma.user.findUnique({
            where: { id }
        })
        if (!user) {
            res.status(404).json({ error: 'User not Found' })
        }
        res.status(200).json({ message: 'Succesfully Fetched User', user })
        //console.log(user)
    } catch (error) {
        console.error(error)
        res.status(404).json({ error: 'User Not Found or Does Not Exist' })
    }
})

/**
 * CREATE.
 * Route: POST /users
 * Creates a new user row.
 */
router.post('/', async (req, res) => {
    const { id, firstName, lastName, email, phoneNum, userType, profPicUrl } = req.body
    try {
        const newUser = await prisma.user.create({
            data: {
                id,
                firstName,
                lastName,
                email,
                phoneNum,
                userType,
                profPicUrl,
            },
        })
        res.status(201).json({ message: 'Succesfully Created A New User: ', newUser })
    } catch (error) {
        console.error(error)
        res.status(400).json({ error: 'Failed to create user' })
    }
})

/**
 * UPDATE.
 * Route: PUT /users/:id
 * Updates an existing user by ID.
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
        res.status(200).json({ message: 'Successfully Updated User', updatedUser })
    } catch (error) {
        console.error(error)
        res.status(404).json({ error: 'User not found or update failed' })
    }
})

/**
 * DELETE.
 * Route: DELETE /users/:id
 * Deletes a User by ID.
 */
router.delete('/:id', async (req, res) => {
    const { id } = req.params
    try {
        const deletedUser = await prisma.user.delete({
            where: { id }
        })
        res.status(200).json({ message: 'User Deleted Succesfully', deletedUser })
    } catch (error) {
        console.error(error)
        res.status(404).json({ error: 'User not found or deletion failed.' })
    }
})

export default router
