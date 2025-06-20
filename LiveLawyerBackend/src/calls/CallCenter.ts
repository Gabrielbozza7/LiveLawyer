import TwilioManager from '../TwilioManager'
import ActiveRoom from './ActiveRoom'
import { UserType } from 'livelawyerlibrary/SocketEventDefinitions'
import { UserSocket } from '../ServerTypes'
import IdentityMap from '../IdentityMap'
import { getSupabaseClient } from '../database/supabase'

export default class CallCenter {
  private readonly _identityMap: IdentityMap
  private readonly twilioManager: TwilioManager
  private readonly waitingParalegals: UserSocket[]
  private readonly waitingLawyers: UserSocket[]
  private readonly activeParalegals: Set<UserSocket>
  private readonly activeLawyers: Set<UserSocket>
  private readonly memberToRoomMapping: Map<UserSocket, ActiveRoom>
  private readonly timeoutFrame: number = 5000
  private readonly userIdToRoom: Map<string, ActiveRoom> = new Map()

  private readonly emergencyContatList = ['5554443210']
  constructor(twilioManager: TwilioManager, identityMap: IdentityMap) {
    this._identityMap = identityMap
    this.twilioManager = twilioManager
    this.waitingParalegals = []
    this.waitingLawyers = []
    this.activeParalegals = new Set()
    this.activeLawyers = new Set()
    this.memberToRoomMapping = new Map()
  }

  // Handler for event: joinAsClient
  public async connectClient(
    client: UserSocket,
    payload: { userId: string; coordinates: { lat: number; lon: number } },
  ): Promise<boolean> {
    if (this.waitingParalegals.length === 0) return false
    const paralegal = this.waitingParalegals.shift()
    console.log(`Removed a paralegal from queue, new length: ${this.waitingParalegals.length}`)
    const clientId = payload.userId
    const paralegalId = this._identityMap.userIdOf(paralegal)

    const room = new ActiveRoom(this.twilioManager, this._identityMap)
    try {
      await room.setup(clientId, paralegalId)
    } catch (error) {
      console.log(
        `There was a problem setting up a new room: ${
          error instanceof Error
            ? `${(error as Error).name}: ${(error as Error).message}`
            : error.toString()
        }`,
      )
      return false
    }
    const clientTokenPromise = this.twilioManager.getAccessToken(room, 'CLIENT', clientId)
    const paralegalTokenPromise = this.twilioManager.getAccessToken(room, 'PARALEGAL', paralegalId)
    const [clientToken, paralegalToken] = await Promise.all([
      clientTokenPromise,
      paralegalTokenPromise,
    ])

    let clientSendPromise = room.connectParticipant(client, clientToken, this.timeoutFrame)
    let paralegalSendPromise = room.connectParticipant(paralegal, paralegalToken, this.timeoutFrame)
    let success = (await Promise.all([clientSendPromise, paralegalSendPromise])).reduce(
      (successfulSoFar, successfulThis) => successfulSoFar && successfulThis,
    )

    // TODO: At some point, there should be better logic for handling a disconnected client, such as returning the paralegal to the queue.
    // The error-handling code following these comments is definitely not ready for production whatsoever.

    if (success) {
      console.log(`Successfully sent participants to ${room.roomName}!`)
      this.activeParalegals.add(paralegal)
      this.memberToRoomMapping.set(client, room)
      this.memberToRoomMapping.set(paralegal, room)

      const lat = payload.coordinates.lat
      const lon = payload.coordinates.lon

      // CHANGE TO SUPABASE ACCOUNT NAME, NOT SECURE
      const name = payload.userId
      this.notifyEmergencyContact(name, this.emergencyContatList, lat, lon)
      return true
    } else {
      console.log(
        `Note: Paralegal with user ID '${paralegalId}' not flagged as active due to connection failure!`,
      )
      paralegal.emit('endCall')
      this.enqueueParalegal(paralegal)
      return false
    }
  }

  public async pullLawyer(paralegal: UserSocket): Promise<boolean> {
    if (this.waitingLawyers.length === 0) return false
    const room: ActiveRoom | undefined = this.memberToRoomMapping.get(paralegal)
    if (room === undefined) {
      console.log(`WARNING: Lawyer request from paralegal who is not in a room {${paralegal.id}}`)
      return
    }
    const lawyer = this.waitingLawyers.shift()
    console.log(`Removed a lawyer from queue, new length: ${this.waitingLawyers.length}`)
    const lawyerId = this._identityMap.userIdOf(lawyer)
    const lawyerToken = await this.twilioManager.getAccessToken(room, 'LAWYER', lawyerId)
    let success: boolean = await room.connectParticipant(lawyer, lawyerToken, this.timeoutFrame)

    // TODO: At some point, there should be better logic for handling a failed lawyer connection.
    // The error-handling code following these comments is definitely not ready for production whatsoever.

    if (success) {
      this.activeLawyers.add(lawyer)
      this.memberToRoomMapping.set(lawyer, room)
      const supabase = await getSupabaseClient()
      const { error } = await supabase
        .from('CallMetadata')
        .update({ lawyerId })
        .eq('id', room.callId)
        .single()
      if (error) {
        console.log(
          `Critical error: Unable to associate lawyer with call in ${room.roomName}: ${error.message}`,
        )
      }
      return true
    } else {
      console.log(
        `Note: Lawyer with user ID '${lawyerId}' not flagged as active due to connection failure!`,
      )
      return false
    }
  }

  public enqueueParalegal(paralegal: UserSocket): UserType {
    this.waitingParalegals.push(paralegal)
    console.log(`Added a paralegal to queue, new length: ${this.waitingParalegals.length}`)
    return 'PARALEGAL'
  }

  public enqueueLawyer(lawyer: UserSocket): UserType {
    this.waitingLawyers.push(lawyer)
    console.log(`Added a lawyer to queue, new length: ${this.waitingLawyers.length}`)
    return 'LAWYER'
  }

  public dequeueWorker(worker: UserSocket): boolean {
    let index: number
    if (
      this.waitingParalegals.find((x, i) => {
        index = i
        return x == worker
      }) !== undefined
    ) {
      this.waitingParalegals.splice(index, 1)
      console.log(`Removed a paralegal from queue, new length: ${this.waitingParalegals.length}`)
      return true
    } else if (
      this.waitingLawyers.find((x, i) => {
        index = i
        return x == worker
      }) !== undefined
    ) {
      this.waitingLawyers.splice(index, 1)
      console.log(`Removed a lawyer from queue, new length: ${this.waitingLawyers.length}`)
      return true
    } else {
      console.log(`WARNING: Unable to dequeue {${worker.id}} due to not existing in a queue!`)
      return false
    }
  }

  public handleHangUp(user: UserSocket) {
    const room: ActiveRoom | undefined = this.memberToRoomMapping.get(user) // looks like a TypeScript soundness issue?
    if (room === undefined) {
      console.log(`WARNING: Hang up attempt from member who is not in a room {${user.id}}`)
      return
    }
    ;(async () => {
      ;(await room.endCall(user)).forEach(participant => {
        if (this.activeParalegals.has(participant)) {
          this.activeParalegals.delete(participant)
          this.enqueueParalegal(participant)
        }
        if (this.activeLawyers.has(participant)) {
          this.activeLawyers.delete(participant)
          this.enqueueLawyer(participant)
        }
        this.memberToRoomMapping.delete(participant)
      })
    })()
  }

  public getRoomByUserId(userId: string): ActiveRoom | undefined {
    return this.userIdToRoom.get(userId)
  }

  public async notifyEmergencyContact(
    name: string,
    emergencyList: string[],
    lat: number,
    lon: number,
  ) {
    emergencyList.forEach(number => {
      this.twilioManager.notifyEmergencyContact(name, number, lat, lon)
    })
  }
}
