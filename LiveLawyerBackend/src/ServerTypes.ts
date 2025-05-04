import {
  ClientToServerEvents,
  ServerToClientEvents,
} from 'livelawyerlibrary/SocketEventDefinitions'
import { DefaultEventsMap, Socket } from 'socket.io'

export type UserSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  DefaultEventsMap,
  unknown
>
