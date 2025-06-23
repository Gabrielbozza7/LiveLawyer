import {
  ClientToServerEvents,
  ServerToClientEvents,
} from 'livelawyerlibrary/socket-event-definitions'
import { Socket, DefaultEventsMap } from 'socket.io'
import TwilioManager from '../TwilioManager'
import { RoomInstance } from 'twilio/lib/rest/video/v1/room'
import { getSupabaseClient } from '../database/supabase'
import IdentityMap from '../IdentityMap'

const ROOM_NAME_PREFIX: string = Math.trunc(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)
let roomNameCounter: number = 0

type UserSocket = Socket<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, unknown>

export default class ActiveRoom {
  private readonly _roomName: string
  private readonly _participants: UserSocket[]
  private readonly _twilioManager: TwilioManager
  private readonly _identityMap: IdentityMap
  private _startedEndSequence: boolean
  private _room: RoomInstance
  private _callId: string

  static async createRoom(
    twilioManager: TwilioManager,
    identityMap: IdentityMap,
    clientId: string,
    observerId: string,
  ): Promise<ActiveRoom> {
    let room = new ActiveRoom(twilioManager, identityMap)
    await room.setup(clientId, observerId)
    return room
  }

  /**
   * IMPORTANT: Make sure that setup() is run immediately after object construction!
   * @param twilioManager The twilioManager from the CallCenter
   */
  private constructor(twilioManager: TwilioManager, identityMap: IdentityMap) {
    this._roomName = `room-${ROOM_NAME_PREFIX}-${roomNameCounter++}`
    this._participants = []
    this._twilioManager = twilioManager
    this._identityMap = identityMap
    this._startedEndSequence = false
    // These next assignments are safe because the setup is always invoked before returning the new instance.
    this._room = undefined!
    this._callId = undefined!
  }

  public get roomName() {
    return this._roomName
  }

  public get callId() {
    return this._callId
  }

  /**
   * Should always run after object construction
   */
  private async setup(clientId: string, observerId: string): Promise<void> {
    const timestamp = new Date().toISOString()
    const supabase = await getSupabaseClient()
    this._room = await this._twilioManager.findOrCreateRoom(this._roomName)
    console.log(`Started room with room name: ${this._roomName}`)
    const { data, error } = await supabase
      .from('CallMetadata')
      .insert({
        clientId,
        observerId,
        twilioRoomSid: this._room.sid,
        startTime: timestamp,
      })
      .select()
      .single()
    if (error) {
      throw error
    }
    this._callId = data.id
  }

  /**
   * Attempts to get a participant to join a video room, retrying 2 more times if necessary, then adds the
   * participant to the room model
   * @param participant The participant to add
   * @returns Whether the participant was successfully added
   */
  public async connectParticipant(
    participant: UserSocket,
    token: string,
    timeout: number,
  ): Promise<boolean> {
    let userId = this._identityMap.userIdOf(participant)
    if (userId === undefined) {
      throw new Error('Invalid participant')
    }
    const timestamp = new Date().toISOString()
    const supabase = await getSupabaseClient()
    const { error } = await supabase
      .from('CallEvent')
      .insert({
        callId: this._callId,
        userId,
        action: 'Connected',
        timestamp,
      })
      .single()
    if (error) {
      console.log(`Critical error: Unable to document call event (Connected): ${error.message}`)
    }

    let successfulSend: boolean = false
    for (let i = 1; i <= 3; i++) {
      try {
        await participant
          .timeout(timeout)
          .emitWithAck('sendToRoom', { token, roomName: this._roomName })
        successfulSend = true
        break
      } catch (error) {
        console.log(
          `User {${participant.id}} failed to acknowledge sendToRoom properly (attempt ${i}/3) with error: ${error}`,
        )
        if (i < 3) {
          console.log(`Attempting to connect user {${participant.id}} in 5 seconds...`)
          await new Promise(res => setTimeout(res, 5000))
          continue
        }
      }
    }
    if (successfulSend) {
      this._participants.push(participant)
    }
    return successfulSend
  }

  /**
   * Removes a participant from the room model without communicating with Twilio
   * @param participant The participant to remove
   * @returns Whether the participant was present in the room model
   */
  public async removeConnectedParticipant(participant: UserSocket): Promise<boolean> {
    let userId = this._identityMap.userIdOf(participant)
    if (userId === undefined) {
      throw new Error('Invalid participant')
    }
    const timestamp = new Date().toISOString()
    const supabase = await getSupabaseClient()
    const { error } = await supabase
      .from('CallEvent')
      .insert({
        callId: this._callId,
        userId,
        action: 'Disconnected',
        timestamp,
      })
      .single()
    if (error) {
      console.log(`Critical error: Unable to document call event (Disconnected): ${error.message}`)
    }
    let index = -1
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
   * @param participant The participant that hung up
   * @returns The list of participants that were sent the endCall event
   */
  public async endCall(participant: UserSocket): Promise<UserSocket[]> {
    if (this._startedEndSequence) {
      console.log(`Cannot end call for ${this._roomName} because it already ended!`)
      return []
    }
    this._startedEndSequence = true
    let userId = this._identityMap.userIdOf(participant)
    if (userId === undefined) {
      throw new Error('Invalid participant')
    }

    const timestamp = new Date().toISOString()
    const supabase = await getSupabaseClient()
    const { error } = await supabase
      .from('CallEvent')
      .insert({
        callId: this._callId,
        userId,
        action: 'Ended Call',
        timestamp,
      })
      .single()
    if (error) {
      console.log(`Critical error: Unable to document call event (Disconnected): ${error.message}`)
    }

    const removedParticipants: UserSocket[] = []
    while (this._participants.length > 0) {
      const participant = this._participants.pop()
      participant!.emit('endCall')
      removedParticipants.push(participant!)
    }
    ;(async () => {
      // Recording management
      await new Promise(resolve => setTimeout(resolve, 5000))
      this._room.recordings().each(recording => {
        console.log(`Identified recorded track with SID of ${recording.sid}`)
        this._twilioManager.recordingProcessor.downloadRecording({
          recording,
          callId: this._callId,
        })
      })
    })()
    return removedParticipants
  }
}
