import express from 'express'
import { Request } from 'express'
import { authenticate, getSupabaseClient } from '../supabase'
import {
  CallHistorySingle,
  RequestParamsCallHistoryList,
  RequestResponseCallHistoryList,
  ROUTE_CALL_HISTORY_LIST,
} from 'livelawyerlibrary/api/types/call-history'
import { ApiResponse, WithAccessToken } from 'livelawyerlibrary/api/types/general'

const router = express.Router()

type RequestCallHistoryList = Request<
  never,
  ApiResponse<RequestResponseCallHistoryList>,
  never,
  WithAccessToken<RequestParamsCallHistoryList>
>

/**
 * Fetch call history for an observer/lawyer.
 */
router.get(ROUTE_CALL_HISTORY_LIST, async (req: RequestCallHistoryList, res) => {
  const supabase = await getSupabaseClient()
  let userId: string
  try {
    userId = await authenticate(req.query.accessToken)
  } catch (authError) {
    res.status(400).json({ success: false, error: (authError as Error).message })
    return
  }
  try {
    const { data: user, error: userError } = await supabase
      .from('User')
      .select()
      .eq('id', userId)
      .single()
    if (userError) {
      res.status(500).json({ success: false, error: 'Unable to fetch user info' })
      return
    }
    let records: CallHistorySingle[] = []
    switch (user.userType) {
      case 'Observer': {
        const { data, error } = await supabase
          .from('CallMetadata')
          .select(
            'id, clientId:User!CallMetadata_clientId_fkey(firstName, lastName), lawyerId:User!CallMetadata_lawyerId_fkey(firstName, lastName), startTime',
          )
          .eq('observerId', user.id)
        if (error) {
          res.status(500).json({ success: false, error: 'Database error' })
          console.log(`Database error: ${(error as Error).message}`)
          return
        }
        records = data.map(record => {
          return {
            id: record.id,
            clientName: `${record.clientId.firstName} ${record.clientId.lastName}`,
            observerName: `${user.firstName} ${user.lastName}`,
            lawyerName: record.lawyerId
              ? `${record.lawyerId.firstName} ${record.lawyerId.lastName}`
              : null,
            startTime: record.startTime,
          }
        })
        break
      }
      case 'Lawyer': {
        const { data, error } = await supabase
          .from('CallMetadata')
          .select(
            'id, clientId:User!CallMetadata_clientId_fkey(firstName, lastName), observerId:User!CallMetadata_observerId_fkey(firstName, lastName), startTime',
          )
          .eq('lawyerId', user.id)
        if (error) {
          res.status(500).json({ success: false, error: 'Database error' })
          console.log(`Database error: ${(error as Error).message}`)
          return
        }
        records = data.map(record => {
          return {
            id: record.id,
            clientName: `${record.clientId.firstName} ${record.clientId.lastName}`,
            observerName: `${record.observerId.firstName} ${record.observerId.lastName}`,
            lawyerName: `${user.firstName} ${user.lastName}`,
            startTime: record.startTime,
          }
        })
        break
      }
    }
    res.status(200).json({ success: true, result: { history: records } })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, error: 'Error' })
  }
})

export default router
