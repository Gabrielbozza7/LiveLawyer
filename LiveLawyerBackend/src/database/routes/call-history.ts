import express from 'express'
import { Request } from 'express'
import { authenticate, getSupabaseClient } from '../supabase'
import {
  CallEvent,
  CallHistorySingle,
  CallRecording,
  RequestParamsCallHistoryDetails,
  RequestParamsCallHistoryList,
  RequestResponseCallHistoryDetails,
  RequestResponseCallHistoryList,
  ROUTE_CALL_HISTORY_DETAILS,
  ROUTE_CALL_HISTORY_LIST,
} from 'livelawyerlibrary/api/types/call-history'
import { ApiResponse, WithAccessToken } from 'livelawyerlibrary/api/types/general'

const router = express.Router()

// Route: /list

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

// Route: /details

type RequestCallHistoryDetails = Request<
  never,
  ApiResponse<RequestResponseCallHistoryDetails>,
  never,
  WithAccessToken<RequestParamsCallHistoryDetails>
>

/**
 * Fetch details for a particular call.
 */
router.get(ROUTE_CALL_HISTORY_DETAILS, async (req: RequestCallHistoryDetails, res) => {
  const supabase = await getSupabaseClient()
  let userId: string
  try {
    userId = await authenticate(req.query.accessToken)
  } catch (authError) {
    res.status(400).json({ success: false, error: (authError as Error).message })
    return
  }
  try {
    const { data, error } = await supabase
      .from('CallMetadata')
      .select(
        'events:CallEvent!CallEvent_callId_fkey(userId, action, timestamp), recordings:CallRecording!CallRecording_callId_fkey(userId, startTime, trackType, s3Ref), client:User!CallMetadata_clientId_fkey(id, firstName, lastName), observer:User!CallMetadata_observerId_fkey(id, firstName, lastName), lawyer:User!CallMetadata_lawyerId_fkey(id, firstName, lastName), startTime',
      )
      .eq('id', req.query.id)
      .single()
    if (
      data === undefined ||
      data === null ||
      !(userId === data.observer.id || userId === data.lawyer.id)
    ) {
      res
        .status(500)
        .json({ success: false, error: 'Unrecognized call or unauthorized call access' })
      return
    }
    const names: Map<string, string> = new Map()
    names.set(data.client.id, `${data.client.firstName} ${data.client.lastName}`)
    names.set(data.observer.id, `${data.observer.firstName} ${data.observer.lastName}`)
    if (data.lawyer) {
      names.set(data.lawyer.id, `${data.lawyer.firstName} ${data.lawyer.lastName}`)
    }
    const events: CallEvent[] = data.events.map(rawEvent => {
      return {
        userName: names.get(rawEvent.userId),
        action: rawEvent.action,
        timestamp: rawEvent.timestamp,
      }
    })
    const recordings: CallRecording[] = []
    for (const rawRecording of data.recordings) {
      const splitIndex = rawRecording.s3Ref.indexOf('/')
      const bucketName = rawRecording.s3Ref.substring(0, splitIndex)
      const path = rawRecording.s3Ref.substring(splitIndex + 1)
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(path, 120, { download: true })
      recordings.push({
        userName: names.get(rawRecording.userId),
        startTime: rawRecording.startTime,
        trackType: rawRecording.trackType,
        downloadLink: error ? '' : data.signedUrl,
      })
    }
    res.status(200).json({ success: true, result: { details: { events, recordings } } })
    if (error) {
      res.status(500).json({ success: false, error: 'Database error' })
      return
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, error: 'Error' })
  }
})

export default router
