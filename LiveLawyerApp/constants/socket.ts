import { io, Socket } from 'socket.io-client'
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from 'livelawyerlibrary/SocketEventDefinitions'

// I would like to be able to use { BACKEND_URL } from 'livelawyerlibrary', but importing it breaks the bundler due to the use
// of the 'path' module in the library's dependency 'dotenv', which doesn't exist in React Native. So, unless a solution for that
// is found, we will have to continue having the backend IP duplicated.

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

function getBackendUrl() {
  getBackendVariables()
  return `http://${BACKEND_IP}:${BACKEND_PORT}`
}

const BACKEND_URL = getBackendUrl()

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(BACKEND_URL)
