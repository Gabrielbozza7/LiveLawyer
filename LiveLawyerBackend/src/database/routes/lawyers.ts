import express from 'express'
import prisma from '../prisma'

const router = express.Router()

/**
 * GET ALL.
 * Route: GET /lawyers
 * Fetch all lawyers.
 */
router.get('/', async (req, res) => {
  try {
    const lawyers = await prisma.lawyer.findMany()
    res.json({ lawyers })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch lawyers' })
  }
})

/**
 * GET ONE.
 * Route: GET /lawyers/:id
 * Fetch a single lawyer by ID.
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const lawyer = await prisma.lawyer.findUnique({
      where: { id },
    })
    if (!lawyer) {
      res.status(404).json({ error: 'Lawyer not found' })
    }
    res.json(lawyer)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch lawyer' })
  }
})

/**
 * CREATE.
 * Route: POST /lawyers
 * Creates a new lawyer row.
 */
router.post('/', async (req, res) => {
  const { name, description, address, phoneNum, email, picUrl } = req.body

  try {
    const lawyer = await prisma.lawyer.create({
      data: {
        name,
        description,
        address,
        phoneNum,
        email,
        picUrl,
      },
    })
    res.status(201).json(lawyer)
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: 'Failed to create lawyer' })
  }
})

/**
 * UPDATE.
 * Route: PUT /lawyers/:id
 * Updates an existing lawyer row by ID.
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { name, description, address, phoneNum, email, picUrl } = req.body

  try {
    const updatedLawyer = await prisma.lawyer.update({
      where: { id },
      data: {
        name,
        description,
        address,
        phoneNum,
        email,
        picUrl,
      },
    })
    res.json(updatedLawyer)
  } catch (error) {
    console.error(error)
    res.status(404).json({ error: 'Lawyer not found or update failed' })
  }
})

/**
 * DELETE.
 * Route: DELETE /lawyers/:id
 * Deletes a lawyer by ID.
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const deletedLawyer = await prisma.lawyer.delete({
      where: { id },
    })
    res.json({ message: 'Lawyer deleted successfully', deletedLawyer })
  } catch (error) {
    console.error(error)
    res.status(404).json({ error: 'Lawyer not found or deletion failed' })
  }
})

export default router
