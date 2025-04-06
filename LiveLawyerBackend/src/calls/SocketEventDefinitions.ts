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
  sendToRoom: (
    payload: { token: string; roomName: string },
    callback: (response: any) => void,
  ) => void
  endCall: () => void
}
