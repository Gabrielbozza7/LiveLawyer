import { WithAccessToken } from './api/types/general'

export interface Coordinates {
  lat: number
  lon: number
}

export type SocketResult = 'OK' | 'INVALID_AUTH'

export interface SocketTokenAuth {
  socketToken: string
}

export interface ClientToServerEvents {
  /**
   * Fired when a socket first connects to the backend server for authentication.
   */
  authenticate: (
    payload: WithAccessToken<{ coordinates: Coordinates | null }>,
    callback: (
      response: { result: SocketResult } & (
        | ({ result: 'OK' } & SocketTokenAuth)
        | { result: 'INVALID_AUTH' }
      ),
    ) => void,
  ) => void
  /**
   * Fired when a client attempts to call an observer
   */
  joinAsClient: (
    payload: SocketTokenAuth,
    callback: (result: SocketResult | 'ALREADY_IN_ROOM' | 'NO_OBSERVERS') => void,
  ) => void
  /**
   * Fired when an observer or lawyer tries to join the queue
   */
  enqueue: (
    payload: SocketTokenAuth,
    callback: (result: SocketResult | 'ALREADY_IN_QUEUE') => void,
  ) => void
  /**
   * Fired when an observer or lawyer tries to exit the queue
   */
  exitQueue: (
    payload: SocketTokenAuth,
    callback: (result: SocketResult | 'NOT_IN_QUEUE') => void,
  ) => void
  /**
   * Fired when an observer tries to pull a lawyer into the call
   */
  summonLawyer: (
    payload: SocketTokenAuth,
    callback: (result: SocketResult | 'NOT_IN_ROOM' | 'NO_LAWYERS') => void,
  ) => void
  /**
   * Fired when a video call participant ends the call
   */
  hangUp: (
    payload: SocketTokenAuth,
    callback: (result: SocketResult | 'NOT_IN_ROOM' | 'CALL_ALREADY_ENDED') => void,
  ) => void
  /**
   * Fired when a user attempts to rejoin a call from which they disconnected (UNUSED)
   */
  rejoinRoomAttempt: (payload: SocketTokenAuth, callback: (didRejoin: boolean) => void) => void
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
