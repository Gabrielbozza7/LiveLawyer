import { defaultEnvironmentVariableWithWarning } from 'livelawyerlibrary'

// I would like to be able to use { BACKEND_URL } from 'livelawyerlibrary/env', but importing it breaks the bundler due to the use
// of the 'path' module in the library's dependency 'dotenv', which doesn't exist in React Native. So, unless a solution for that
// is found, we will have to continue having the backend IP duplicated.

export function getBackendVariables(): [ip: string, port: string] {
  const path = 'LiveLawyerApp/.env'
  const ip = defaultEnvironmentVariableWithWarning(
    process.env.EXPO_PUBLIC_BACKEND_IP,
    'EXPO_PUBLIC_BACKEND_IP',
    path,
    'localhost',
    false,
  )
  const port = defaultEnvironmentVariableWithWarning(
    process.env.EXPO_PUBLIC_BACKEND_PORT,
    'EXPO_PUBLIC_BACKEND_PORT',
    path,
    '4000',
    false,
  )
  return [ip, port]
}

export const [BACKEND_IP, BACKEND_PORT] = getBackendVariables()
export const BACKEND_URL = `http://${BACKEND_IP}:${BACKEND_PORT}`
