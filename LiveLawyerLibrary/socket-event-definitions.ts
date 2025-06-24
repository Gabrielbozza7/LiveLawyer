import { UserType } from '.'
import { WithAccessToken } from './api/types/general'

export interface Coordinates {
  lat: number
  lon: number
}

export type SocketResult = 'OK' | 'INVALID_AUTH'

export interface ClientToServerEvents {
  /**
   * Fired when a socket first connects to the backend server for authentication.
   */
  authenticate: (
    payload: WithAccessToken<unknown>,
    callback: (result: SocketResult) => void,
  ) => void
  /**
   * Fired when a client attempts to call an observer
   */
  joinAsClient: (
    payload: { coordinates: Coordinates },
    callback: (result: SocketResult | 'NO_OBSERVERS') => void,
  ) => void
  /**
   * Fired when an observer tries to join the queue
   */
  joinAsObserver: (payload: null, callback: (result: SocketResult) => void) => void
  /**
   * Fired when a lawyer tries to join the queue
   */
  joinAsLawyer: (
    payload: { coordinates: Coordinates },
    callback: (result: SocketResult | 'NO_STATE') => void,
  ) => void
  /**
   * Fired when an observer tries to pull a lawyer into the call
   */
  summonLawyer: (payload: null, callback: (result: SocketResult | 'NO_LAWYERS') => void) => void
  /**
   * Fired when an observer or lawyer tries to leave the queue
   */
  dequeue: (payload: null, callback: (result: SocketResult | 'NOT_IN_QUEUE') => void) => void
  /**
   * Fired when a video call participant ends the call
   */
  hangUp: () => void
  /**
   * Fired when a user attempts to rejoin a call from which they disconnected (UNUSED)
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
   * Fired when a disconnected user successfully rejoins a call (UNUSED)
   */
  rejoinRoomSuccess: (payload: { token: string; roomName: string }) => void
}
