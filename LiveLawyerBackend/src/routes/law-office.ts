import express from 'express'
import { Request } from 'express'
import { ApiResponse, WithAccessToken } from 'livelawyerlibrary/api/types/general'
import {
  RequestParamsLawOfficeDetails,
  RequestResponseLawOfficeDetails,
  ROUTE_LAW_OFFICE_DETAILS,
} from 'livelawyerlibrary/api/types/law-office'
import { authenticate, getSupabaseClient } from '../database/supabase'

const router = express.Router()

// Route: /details

type RequestLawOfficeDetails = Request<
  never,
  ApiResponse<RequestResponseLawOfficeDetails>,
  never,
  WithAccessToken<RequestParamsLawOfficeDetails>
>

/**
 * Fetch details for a particular call.
 */
router.get(ROUTE_LAW_OFFICE_DETAILS, async (req: RequestLawOfficeDetails, res) => {
  const supabase = await getSupabaseClient()
  try {
    await authenticate(req.query.accessToken)
  } catch (authError) {
    res.status(400).json({ success: false, error: (authError as Error).message })
    return
  }
  try {
    const { data: officeData, error: officeError } = await supabase
      .from('LawOffice')
      .select()
      .eq('id', req.query.officeId)
      .single()
    if (officeError) {
      console.error(officeError)
      res.status(500).json({ success: false, error: 'Database error' })
      return
    }
    if (officeData === null) {
      res.status(400).json({ success: false, error: 'Unrecognized law office' })
      return
    }
    const { data: lawyersData, error: lawyersError } = await supabase
      .from('UserLawyer')
      .select('lawyer:User(id, firstName, lastName)')
      .eq('officeId', req.query.officeId)
    if (lawyersError) {
      console.error(lawyersError)
      res.status(500).json({ success: false, error: 'Database error' })
      return
    }
    if (lawyersData === null) {
      res.status(400).json({ success: false, error: 'Unrecognized law office' })
      return
    }
    const lawyers = lawyersData.map(lawyer => {
      return {
        id: lawyer.lawyer.id,
        name: `${lawyer.lawyer.firstName} ${lawyer.lawyer.lastName}`,
      }
    })
    res.status(200).json({ success: true, result: { details: { name: officeData.name, lawyers } } })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, error: 'Error' })
  }
})

export default router
