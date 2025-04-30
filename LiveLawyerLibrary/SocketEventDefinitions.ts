export type UserType = 'CLIENT' | 'PARALEGAL' | 'LAWYER'

export interface ClientToServerEvents {
  joinAsClient: (
    payload: { userId: string; coordinates: { lat: number; lon: number } | null },
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
  rejoinRoomAttempt: (
    payload: { userId: string; userType: UserType },
    callback: (didRejoin: boolean) => void,
  ) => void
}

export interface ServerToClientEvents {
  sendToRoom: (
    payload: { token: string; roomName: string },
    callback: (acknowledged: boolean) => void,
  ) => void
  endCall: () => void
  rejoinRoomSuccess: (payload: { token: string; roomName: string }) => void
}
