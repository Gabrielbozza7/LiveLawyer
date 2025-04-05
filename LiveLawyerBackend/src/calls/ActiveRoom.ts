import { Socket, DefaultEventsMap } from 'socket.io'
import { ClientToServerEvents, ServerToClientEvents } from './SocketEventDefinitions'

type UserSocket = Socket<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, unknown>

export default interface ActiveRoom {
  roomName: string
  participants: UserSocket[]
}
