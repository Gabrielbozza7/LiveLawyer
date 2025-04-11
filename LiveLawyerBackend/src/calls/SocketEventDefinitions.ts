export type UserType = 'CLIENT' | 'PARALEGAL' | 'LAWYER'

export interface ClientToServerEvents {
  joinAsClient: (
    payload: { userId: string },
    callback: (isParalegalAvailable: boolean) => void,
  ) => void // for when the client is making a call
  joinAsParalegal: (
    payload: { userId: string },
    callback: (queuedUserType: UserType) => void,
  ) => void
  joinAsLawyer: (payload: { userId: string }, callback: (queuedUserType: UserType) => void) => void
  summonLawyer: (payload: null, callback: (isLawyerAvailable: boolean) => void) => void
  dequeue: (payload: null, callback: (didExitQueue: boolean) => void) => void
  hangUp: () => void
}

export interface ServerToClientEvents {
<<<<<<< HEAD
  sendToRoom: (
    payload: { token: string; roomName: string },
    callback: (acknowledged: boolean) => void,
  ) => void
=======
  sendToRoom: (payload: { token: string; roomName: string }) => void
>>>>>>> e29916c5dc13b9cddaddc3fc977fa3cc719f9697
  endCall: () => void
}
