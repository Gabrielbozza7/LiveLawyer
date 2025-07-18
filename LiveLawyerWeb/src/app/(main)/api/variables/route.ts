import { BACKEND_IP, BACKEND_PORT, BACKEND_URL } from 'livelawyerlibrary/env'

// This file isn't really useful anymore (as it was originally intended to solve a problem that I found a better way to solve),
// but it can still be used to check if the environment variables are loading properly. If you are running this on your local
// machine on port 3000, you can try visiting http://localhost:3000/api/variables to check if the variables are correct.

export async function GET() {
  const json = {
    BACKEND_IP: BACKEND_IP,
    BACKEND_PORT: BACKEND_PORT,
    BACKEND_URL: BACKEND_URL,
  }
  return new Response(JSON.stringify(json), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
