import { io, Socket } from 'socket.io-client'
import { ClientToServerEvents, ServerToClientEvents } from './SocketEventDefinitions'
// "undefined" means the URL will be computed from the `window.location` object

const [BACKEND_IP, BACKEND_PORT] = getBackendVariables()

export function getBackendVariables(): [ip: string, port: string] {
  let ip = process.env.EXPO_PUBLIC_BACKEND_IP
  let port = process.env.EXPO_PUBLIC_BACKEND_PORT
  if (ip === undefined) {
    console.log(
      "WARNING: EXPO_PUBLIC_BACKEND_IP environment variable not set, defaulting to 'localhost'!",
    )
    ip = 'localhost'
  }
  if (port === undefined) {
    console.log(
      "WARNING: EXPO_PUBLIC_BACKEND_PORT environment variable not set, defaulting to '4000'!",
    )
    port = '4000'
  }
  return [ip, port]
}

function getURL() {
  getBackendVariables()
  return `http://${BACKEND_IP}:${BACKEND_PORT}`
}

const URL = getURL()
// ^ This should be pulled from a shared configuration at some point.

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(URL)
