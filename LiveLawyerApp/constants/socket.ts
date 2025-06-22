import { io, Socket } from 'socket.io-client'
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from 'livelawyerlibrary/socket-event-definitions'
import { BACKEND_URL } from './BackendVariables'

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(BACKEND_URL)
