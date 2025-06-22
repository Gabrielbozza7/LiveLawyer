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
  userName: string
  startTime: string
  trackType: Database['public']['Enums']['TrackType']
  downloadLink: string
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
  id: string
}

export interface RequestResponseCallHistoryDetails {
  details: CallHistoryDetailsSingle
}
