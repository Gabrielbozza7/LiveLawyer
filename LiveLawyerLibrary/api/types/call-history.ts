import { Database } from '../../database-types'

// Data:

export interface CallHistorySingle {
  id: string
  clientName: string
  observerName: string
  lawyerName: string | null
  startTime: string
}

export interface CallEvent {
  userName: string
  action: string
  timestamp: string
}

export interface CallRecording {
  id: string
  userName: string
  startTime: string
  trackType: Database['public']['Enums']['TrackType']
}

export interface CallHistoryDetailsSingle {
  events: CallEvent[]
  recordings: CallRecording[]
}

// Router for: /call-history
export const ROUTER_CALL_HISTORY = '/call-history'

// Route: /list
export const ROUTE_CALL_HISTORY_LIST = '/list'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface RequestParamsCallHistoryList {}

export interface RequestResponseCallHistoryList {
  history: CallHistorySingle[]
}

// Route: /details
export const ROUTE_CALL_HISTORY_DETAILS = '/details'

export interface RequestParamsCallHistoryDetails {
  callId: string
}

export interface RequestResponseCallHistoryDetails {
  details: CallHistoryDetailsSingle
}

// Route: /download
export const ROUTE_CALL_HISTORY_DOWNLOAD = '/download'

export interface RequestParamsCallHistoryDownload {
  recordingId: string
}

export interface RequestResponseCallHistoryDownload {
  downloadLink: string
}
