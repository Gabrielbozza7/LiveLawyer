// Data:

export interface CallHistorySingle {
  id: string
  clientName: string
  observerName: string
  lawyerName: string | null
  startTime: string
}

// Routes: /call-history

export const ROUTER_CALL_HISTORY = '/call-history'
export const ROUTE_CALL_HISTORY_LIST = '/list'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface RequestParamsCallHistoryList {}

export interface RequestResponseCallHistoryList {
  history: CallHistorySingle[]
}
