type UserType = 'CLIENT' | 'PARALEGAL' | 'LAWYER'

export interface ClientToServerEvents {
  joinAsClient: (payload: { userId: string }) => void // for when the client is making a call
  joinAsParalegal: (payload: { userId: string }) => void
  joinAsLawyer: (payload: { userId: string }) => void
  dequeue: () => void
  hangUp: () => void
}

export interface ServerToClientEvents {
  rejectFromNoParalegals: () => void // indication that there are no paralegals available
  rejectFromNoLawyers: () => void // indication to paralegal that there are no lawyers available
  notifyQueueEntry: (payload: { userType: UserType }) => void // indication for the paralegal/lawyer that they are now accepting calls
  notifyQueueExit: () => void // indication for the paralegal/lawyer that they are no longer accepting calls
  sendToRoom: (payload: { token: string; roomName: string }) => void
  endCall: () => void
}
