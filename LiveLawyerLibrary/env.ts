import dotenv from 'dotenv'
import { defaultEnvironmentVariableWithWarning } from '.'

function getBackendVariables(): [ip: string, port: string] {
  let dir = __dirname
  const NEXTJS_WRONG_PATH = /LiveLawyerWeb\/\.next\/server\/app\/.*$/
  if (dir.match(NEXTJS_WRONG_PATH)) {
    dir = dir.replace(NEXTJS_WRONG_PATH, 'LiveLawyerLibrary')
  }
  const path = dir + '/.env'
  dotenv.config({ path: path })
  const ip = defaultEnvironmentVariableWithWarning(
    process.env.BACKEND_IP,
    'BACKEND_IP',
    path,
    'localhost',
    false,
  )
  const port = defaultEnvironmentVariableWithWarning(
    process.env.BACKEND_PORT,
    'BACKEND_PORT',
    path,
    '4000',
    false,
  )
  return [ip, port]
}

export const [BACKEND_IP, BACKEND_PORT] = getBackendVariables()
export const BACKEND_URL = BACKEND_IP ? `http://${BACKEND_IP}:${BACKEND_PORT}` : ''
