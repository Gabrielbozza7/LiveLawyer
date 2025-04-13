import dotenv from 'dotenv'

function getBackendVariables(): [ip: string, port: string] {
  let dir = __dirname
  const NEXTJS_WRONG_PATH = /LiveLawyerWeb\/\.next\/server\/app\/.*$/
  if (dir.match(NEXTJS_WRONG_PATH)) {
    dir = dir.replace(NEXTJS_WRONG_PATH, 'LiveLawyerLibrary')
  }
  dotenv.config({ path: dir + '/.env' })
  let ip = process.env.BACKEND_IP
  let port = process.env.BACKEND_PORT
  console.log(dir)
  if (ip === undefined) {
    console.log("WARNING: BACKEND_IP environment variable not set, defaulting to 'localhost'!")
    ip = 'localhost'
  }
  if (port === undefined) {
    console.log("WARNING: BACKEND_PORT environment variable not set, defaulting to '4000'!")
    port = '4000'
  }
  return [ip, port]
}

export const [BACKEND_IP, BACKEND_PORT] = getBackendVariables()
export const BACKEND_URL = `http://${BACKEND_IP}:${BACKEND_PORT}`
