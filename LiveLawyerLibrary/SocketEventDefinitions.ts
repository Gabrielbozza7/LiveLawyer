export type UserType = 'CLIENT' | 'PARALEGAL' | 'LAWYER'

export interface AuthPayload {
  userId: string
  userSecret: string
}

export interface ClientToServerEvents {
  /**
   * Fired when a client attempts to call a paralegal
   */
  joinAsClient: (
    payload: { coordinates: { lon: number; lat: number } } & AuthPayload,
    callback: (clientJoinStatusCode: 'OK' | 'NO_PARALEGALS' | 'INVALID_AUTH') => void,
  ) => void
  /**
   * Fired when a paralegal tries to join the queue
   */
  joinAsParalegal: (
    payload: AuthPayload,
    callback: (queuedUserType: UserType | 'INVALID_AUTH') => void,
  ) => void
  /**
   * Fired when a lawyer tries to join the queue
   */
  joinAsLawyer: (
    payload: AuthPayload,
    callback: (queuedUserType: UserType | 'INVALID_AUTH') => void,
  ) => void
  /**
   * Fired when a paralegal tries to pull a lawyer into the call
   */
  summonLawyer: (payload: null, callback: (isLawyerAvailable: boolean) => void) => void
  /**
   * Fired when a paralegal or lawyer tries to leave the queue
   */
  dequeue: (payload: null, callback: (didExitQueue: boolean) => void) => void
  /**
   * Fired when a video call participant ends the call
   */
  hangUp: () => void
  /**
   * Fired when a user attempts to rejoin a call from which they disconnected
   */
  rejoinRoomAttempt: (
    payload: { userId: string; userType: UserType },
    callback: (didRejoin: boolean) => void,
  ) => void
}

export interface ServerToClientEvents {
  /**
   * Fired when a user is sent to a video call room
   */
  sendToRoom: (
    payload: { token: string; roomName: string },
    callback: (acknowledged: boolean) => void,
  ) => void
  /**
   * Fired when any video call participant ends the call
   */
  endCall: () => void
  /**
   * Fired when a disconnected user successfully rejoins a call
   */
  rejoinRoomSuccess: (payload: { token: string; roomName: string }) => void
}
