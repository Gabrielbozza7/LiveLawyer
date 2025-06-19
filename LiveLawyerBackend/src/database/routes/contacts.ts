import express from 'express'
import prisma from '../prisma'

const router = express.Router()

/**
 * GET ALL.
 * Route: GET /contacts
 * Fetch ALL Contacts in DB.
 */
router.get('/', async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany()
    if (!contacts || contacts.length === 0) {
      res.status(404).json({ error: 'Error Fetching Contacts or No Contacts Exist' })
    } else {
      res.status(200).json({ contacts: contacts })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error Fetching Contacts' })
  }
})

/**
 * GET ONE.
 * Route: GET /contacts/:id
 * Fetch a singular contact information by ID.
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const contact = await prisma.contact.findUnique({ where: { id } })
    if (!contact) {
      res.status(404).json({ error: 'Contact not found' })
    } else {
      res.status(200).json({ message: 'Contact Retrieval Successful', contact })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to Fetch Contact' })
  }
})

/**
 * GET ALL FOR ONE USER.
 * Route: GET /contacts/user/:id
 * Fetch all contacts that a single user has.
 */
router.get('/user/:id', async (req, res) => {
  const { id: userId } = req.params
  try {
    const contacts = await prisma.contact.findMany({ where: { userId } })
    if (!contacts || contacts.length === 0) {
      res.status(404).json({ error: 'No contacts found for this user' })
    } else {
      res.status(200).json({ message: "Given User's contacts Successfully Retrieved", contacts })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch contacts for user' })
  }
})

/**
 * CREATE.
 * Route: POST /contacts/:id
 * Create a contact that will be connected to a User.
 */
router.post('/', async (req, res) => {
  const { userId, firstName, lastName, picUrl, phoneNum, email, type } = req.body

  if (!userId || !firstName || !lastName || !phoneNum) {
    res.status(400).json({ error: 'Missing required fields' })
  } else {
    try {
      const newContact = await prisma.contact.create({
        data: {
          userId,
          firstName,
          lastName,
          picUrl,
          phoneNum,
          email,
          type, //ENUM USERTYPE
        },
      })
      res.status(201).json({ message: 'Contact created successfully', newContact })
    } catch (error) {
      console.error(error)
      res.status(400).json({ error: 'Failed to create contact' })
    }
  }
})
/**
 * UPDATE.
 * Route: PUT /contacts/:id
 * Update a contact's info.
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { firstName, lastName, picUrl, phoneNum, email, type } = req.body
  try {
    const updatedContact = await prisma.contact.update({
      where: { id },
      data: {
        firstName,
        lastName,
        picUrl,
        phoneNum,
        email,
        type, //ENUM USERTYPE
      },
    })
    res.status(200).json({ message: 'Contact updated successfully', updatedContact })
  } catch (error) {
    console.error(error)
    res.status(404).json({ error: 'Contact not found or update failed' })
  }
})

/**
 * DELETE.
 * Route: DELETE /contacts/:id
 * Delete a contact's information from the DB.
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const deletedContact = await prisma.contact.delete({
      where: { id },
    })
    res.status(200).json({ message: 'Contact deleted successfully', deletedContact })
  } catch (error) {
    console.error(error)
    res.status(404).json({ error: 'Contact not found or deletion failed' })
  }
})

export default router
