import express from 'express'
import { Request } from 'express'
import { authenticate, getSupabaseClient } from '../database/supabase'
import {
  CallEvent,
  CallHistorySingle,
  CallRecording,
  RequestParamsCallHistoryDetails,
  RequestParamsCallHistoryDownload,
  RequestParamsCallHistoryList,
  RequestResponseCallHistoryDetails,
  RequestResponseCallHistoryDownload,
  RequestResponseCallHistoryList,
  ROUTE_CALL_HISTORY_DETAILS,
  ROUTE_CALL_HISTORY_DOWNLOAD,
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
 * Fetch call history for an observer, lawyer, or client.
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
      .select('userType')
      .eq('id', userId)
      .single()
    if (userError) {
      res.status(500).json({ success: false, error: 'Unable to fetch user info' })
      return
    }

    let idColumn: string
    switch (user.userType) {
      case 'Client':
        idColumn = 'clientId'
        break
      case 'Observer':
        idColumn = 'observerId'
        break
      case 'Lawyer':
        idColumn = 'lawyerId'
        break
      default:
        res.status(400).json({ success: false, error: 'Incompatible user type' })
        return
    }

    let records: CallHistorySingle[] = []
    const { data, error } = await supabase
      .from('CallMetadata')
      .select(
        'id, client:User!CallMetadata_clientId_fkey(firstName, lastName), observer:User!CallMetadata_observerId_fkey(firstName, lastName), lawyer:User!CallMetadata_lawyerId_fkey(firstName, lastName), startTime',
      )
      .eq(idColumn, userId)
    if (error) {
      res.status(500).json({ success: false, error: 'Database error' })
      console.log(`Database error: ${(error as Error).message}`)
      return
    }
    records = data.map(record => {
      return {
        id: record.id,
        clientName: `${record.client.firstName} ${record.client.lastName}`,
        observerName: `${record.observer.firstName} ${record.observer.lastName}`,
        lawyerName: record.lawyer ? `${record.lawyer.firstName} ${record.lawyer.lastName}` : null,
        startTime: record.startTime,
      }
    })
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
        'events:CallEvent!CallEvent_callId_fkey(userId, action, timestamp), recordings:CallRecording!CallRecording_callId_fkey(id, userId, startTime, trackType), client:User!CallMetadata_clientId_fkey(id, firstName, lastName), observer:User!CallMetadata_observerId_fkey(id, firstName, lastName), lawyer:User!CallMetadata_lawyerId_fkey(id, firstName, lastName), startTime',
      )
      .eq('id', req.query.callId)
      .single()
    if (error) {
      res.status(500).json({ success: false, error: 'Database error' })
      return
    }
    if (
      data === undefined ||
      data === null ||
      !(userId === data.observer.id || userId === data.lawyer?.id)
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
        userName: names.get(rawEvent.userId) ?? 'Unknown',
        action: rawEvent.action,
        timestamp: rawEvent.timestamp,
      }
    })
    const recordings: CallRecording[] = data.recordings.map(rawRecording => {
      return {
        id: rawRecording.id,
        userName: names.get(rawRecording.userId) ?? 'Unknown',
        startTime: rawRecording.startTime,
        trackType: rawRecording.trackType,
      }
    })
    res.status(200).json({ success: true, result: { details: { events, recordings } } })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, error: 'Error' })
  }
})

// Route: /download

type RequestCallHistoryDownload = Request<
  never,
  ApiResponse<RequestResponseCallHistoryDownload>,
  never,
  WithAccessToken<RequestParamsCallHistoryDownload>
>

/**
 * Fetch a signed download link for a particular recording.
 */
router.get(ROUTE_CALL_HISTORY_DOWNLOAD, async (req: RequestCallHistoryDownload, res) => {
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
      .from('CallRecording')
      .select('call:callId(observerId, lawyerId), s3Ref')
      .eq('id', req.query.recordingId)
      .single()
    if (error) {
      res.status(500).json({ success: false, error: 'Database error' })
      return
    }
    if (
      data === undefined ||
      data === null ||
      // This is where the logic for determining whether a download was approved should eventually go.
      !(userId === data.call.observerId || userId === data.call.lawyerId)
    ) {
      res
        .status(500)
        .json({ success: false, error: 'Unrecognized recording or unauthorized recording access' })
      return
    }
    // TODO: Change schema so that this is always defined
    const s3RefSplit = data.s3Ref!.split('/', 3)
    const bucketName = s3RefSplit[0]
    const directoryName = s3RefSplit[1]
    const fileName = s3RefSplit[2]
    const extensionWithDot = fileName.substring(fileName.indexOf('.'))
    const pathInBucket = directoryName + '/' + fileName
    const { data: linkData, error: linkError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(pathInBucket, 15 * 60 * 1000, {
        download: req.query.recordingId + extensionWithDot,
      })
    if (linkError) {
      console.error(linkError)
      res.status(500).json({ success: false, error: 'Problem with link generation' })
      return
    }
    res.status(200).json({ success: true, result: { downloadLink: linkData.signedUrl } })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, error: 'Error' })
  }
})

export default router
