import {
  ClientToServerEvents,
  ServerToClientEvents,
} from 'livelawyerlibrary/SocketEventDefinitions'
import { Socket, DefaultEventsMap } from 'socket.io'

type UserSocket = Socket<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, unknown>

export default interface ActiveRoom {
  roomName: string
  participants: UserSocket[]
}
