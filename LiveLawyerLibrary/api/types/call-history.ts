// Data:

export interface CallHistorySingle {
  id: string
  clientName: string
  paralegalName: string
  lawyerName: string | null
  startTime: string
}

// Route: /call-history

export const ROUTE_CALL_HISTORY = '/call-history'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface RequestParamsCallHistory {}

export interface RequestResponseCallHistory {
  history: CallHistorySingle[]
}
