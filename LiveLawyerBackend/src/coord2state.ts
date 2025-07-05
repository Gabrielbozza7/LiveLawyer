import { Database } from 'livelawyerlibrary/database-types'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

let js: string

export async function loadGeolocationFunction() {
  let fileLocation = path.resolve(
    // This has to change if this file is moved.
    path.join(__dirname, '..', 'node_modules', 'coord2state', 'dist', 'coord2state.min.js'),
  )
  js = (await readFile(fileLocation)).toString() + ' getState(lat, lon)'
}

export function stateFromCoordinates(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  lat: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  lon: number,
): null | Database['public']['Enums']['UsState'] {
  return eval(js)
}
