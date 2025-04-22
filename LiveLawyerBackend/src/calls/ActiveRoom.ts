import {
  ClientToServerEvents,
  ServerToClientEvents,
} from 'livelawyerlibrary/SocketEventDefinitions'
import { Socket, DefaultEventsMap } from 'socket.io'
import TwilioManager from '../TwilioManager'
import { RoomInstance } from 'twilio/lib/rest/video/v1/room'

const ROOM_NAME_PREFIX: string = Math.trunc(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)
let roomNameCounter: number = 0

type UserSocket = Socket<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, unknown>

export default class ActiveRoom {
  private readonly _roomName: string
  private readonly _participants: UserSocket[]
  private readonly _twilioManager: TwilioManager
  private _startedEndSequence: boolean
  private _room: RoomInstance | undefined

  /**
   * IMPORTANT: Make sure that setup() is run immediately after object construction!
   * @param twilioManager The twilioManager from the CallCenter
   */
  constructor(twilioManager: TwilioManager) {
    this._roomName = `room-${ROOM_NAME_PREFIX}-${roomNameCounter++}`
    this._participants = []
    this._twilioManager = twilioManager
    this._startedEndSequence = false
    this._room = undefined
  }

  public get roomName() {
    return this._roomName
  }

  /**
   * Should always run after object construction
   */
  public async setup(): Promise<void> {
    this._room = await this._twilioManager.findOrCreateRoom(this._roomName)
    console.log(`Started room with room name: ${this._roomName}`)
  }

  /**
   * Adds a participant to the room model without communicating with Twilio
   * @param participant The participant to add
   */
  public addConnectedParticipant(participant: UserSocket) {
    this._participants.push(participant)
  }

  /**
   * Removes a participant from the room model without communicating with Twilio
   * @param participant The participant to remove
   */
  public removeConnectedParticipant(participant: UserSocket): boolean {
    let index: number
    if (
      this._participants.find((value, i) => {
        index = i
        return participant === value
      }) !== undefined
    ) {
      this._participants.splice(index)
      return true
    } else {
      return false
    }
  }

  /**
   * Sends the endCall event to everyone in the call and starts the video storage process
   * @returns The list of participants that were sent the endCall event
   */
  public async endCall() {
    if (this._room === undefined) {
      console.log(`Cannot end call for ${this._roomName} because it had an improper setup!`)
      return
    } else if (this._startedEndSequence) {
      console.log(`Cannot end call for ${this._roomName} because it already ended!`)
      return
    }
    this._startedEndSequence = true
    const removedParticipants: UserSocket[] = []
    while (this._participants.length > 0) {
      const participant = this._participants.pop()
      participant.emit('endCall')
      removedParticipants.push(participant)
    }
    await new Promise(resolve => setTimeout(resolve, 5000))
    // Do video storage code here!
    // First, deal with inserting recordings into database:
    console.log(`Final length of recordings for ${this._roomName}: ${this._room.recordings.length}`)
    this._room.recordings().each(recording => {
      console.log(
        'Identified recorded track:\n' +
          `\tRoom SID: ${recording.roomSid}\n` +
          `\tSID: ${recording.sid}\n` +
          `\tType: ${recording.type}\n` +
          `\tTrack Name: ${recording.trackName}\n` +
          `\tDate: ${recording.dateCreated.toString()}\n` +
          `\tURL: ${recording.url}`,
      )
    })
    return removedParticipants
  }
}
