export interface ClientToServerEvents {
  joinAsClient: (payload: { userId: string }) => void // for when the client is making a call
  joinAsParalegal: (payload: { userId: string }) => void
  hangUp: () => void
}

export interface ServerToClientEvents {
  rejectFromNoParalegals: () => void // indication that there are no paralegals available
  notifyParalegalQueueEntry: () => void // indication for the paralegal that they are now accepting calls
  sendToRoom: (payload: { token: string; roomName: string }) => void
  endCall: () => void
}
