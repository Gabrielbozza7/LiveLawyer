import { connect, Room, Participant } from 'twilio-video'

const [BACKEND_IP, BACKEND_PORT] = getBackendVariables()

export function getBackendVariables(): [ip: string, port: string] {
  let ip = process.env.NEXT_PUBLIC_BACKEND_IP
  let port = process.env.NEXT_PUBLIC_BACKEND_PORT
  if (ip === undefined) {
    console.log(
      "WARNING: NEXT_PUBLIC_BACKEND_IP environment variable not set, defaulting to 'localhost'!",
    )
    ip = 'localhost'
  }
  if (port === undefined) {
    console.log(
      "WARNING: NEXT_PUBLIC_BACKEND_PORT environment variable not set, defaulting to '4000'!",
    )
    port = '4000'
  }
  return [ip, port]
}

export default class TwilioVideoRoom {
  private token: string
  private room: Room | undefined
  private allParticipants: Participant[]
  private callback: ((updatedParticipants: Participant[]) => void) | undefined

  constructor() {
    this.token = ''
    this.room = undefined
    this.allParticipants = []
    this.callback = undefined
  }

  public async joinRoom(roomName: string): Promise<boolean> {
    try {
      const link = `http://${BACKEND_IP}:${BACKEND_PORT}/join-room`
      console.log(link)
      const response = await fetch(link, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomName: roomName }),
        mode: 'cors',
      })
      const { token: retrievedToken } = await response.json()
      this.token = retrievedToken
    } catch (error: unknown) {
      console.log(`POST error: ${(error as Error).message}`)
      return false
    }
    try {
      this.room = await connect(this.token, {
        name: roomName,
      })
    } catch (error: unknown) {
      console.log(`Able to get token, but could not join room: ${(error as Error).message}`)
      return false
    }
    return true
  }

  public get inARoom(): boolean {
    return this.room !== undefined
  }

  public async disconnect() {
    if (this.room === undefined) {
      console.log("Cannot leave a room that hasn't been joined!")
      return
    } else {
      console.log('Leaving room...')
      this.room.disconnect()
      this.room = undefined
    }
  }

  public setupListeners(callback: (updatedParticipants: Participant[]) => void) {
    if (this.room === undefined) {
      throw new Error("Cannot setup listeners if a room hasn't been joined!")
    }
    this.callback = callback

    this.allParticipants = [this.room.localParticipant]
    this.room.participants.forEach(participant => {
      this.allParticipants.push(participant)
    })
    this.room.on('participantConnected', participant => {
      this.allParticipants.push(participant)
      callback([...this.allParticipants])
    })
    window.addEventListener('pagehide', () => this.disconnect())
    window.addEventListener('beforeunload', () => this.disconnect())
    callback([...this.allParticipants])
  }

  public receiveDisconnection(participant: Participant) {
    if (this.callback === undefined) {
      throw new Error('Callback undefined!')
    }
    this.allParticipants.splice(
      this.allParticipants.findIndex(value => value == participant),
      1,
    )
    this.callback([...this.allParticipants])
  }
}
