import { io, Socket } from 'socket.io-client'
import { ClientToServerEvents, ServerToClientEvents } from './call/SocketEventDefinitions'
// import { app } from './page'
// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:4000'
// ^ This should be pulled from a shared configuration at some point.

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(URL)
