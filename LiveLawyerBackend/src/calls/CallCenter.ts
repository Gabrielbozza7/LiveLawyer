import TwilioManager from '../TwilioManager'
import ActiveRoom from './ActiveRoom'
import { UserType } from 'livelawyerlibrary'
import { UserSocket } from '../server-types'
import IdentityMap from '../IdentityMap'
import { getSupabaseClient } from '../database/supabase'
import { Coordinates } from 'livelawyerlibrary/socket-event-definitions'

export default class CallCenter {
  private readonly _identityMap: IdentityMap
  private readonly twilioManager: TwilioManager
  private readonly waitingObservers: UserSocket[]
  private readonly waitingLawyers: UserSocket[]
  private readonly activeObservers: Set<UserSocket>
  private readonly activeLawyers: Set<UserSocket>
  private readonly memberToRoomMapping: Map<UserSocket, ActiveRoom>
  private readonly timeoutFrame: number = 5000
  private readonly userIdToRoom: Map<string, ActiveRoom> = new Map()

  private readonly emergencyContatList = ['5554443210']
  constructor(twilioManager: TwilioManager, identityMap: IdentityMap) {
    this._identityMap = identityMap
    this.twilioManager = twilioManager
    this.waitingObservers = []
    this.waitingLawyers = []
    this.activeObservers = new Set()
    this.activeLawyers = new Set()
    this.memberToRoomMapping = new Map()
  }

  // Handler for event: joinAsClient
  public async connectClient(
    client: UserSocket,
    userId: string,
    coordinates: Coordinates,
  ): Promise<boolean> {
    let observerId: string | undefined = undefined
    let observer: UserSocket | undefined = undefined
    while (this.waitingObservers.length > 0) {
      observer = this.waitingObservers.shift()
      console.log(`Removed an observer from queue, new length: ${this.waitingObservers.length}`)
      const id = this._identityMap.userIdOf(observer!)
      if (id === undefined) {
        console.log(`Invalid observer, skipping...`)
      } else {
        observerId = id
        break
      }
    }
    if (observerId === undefined || observer === undefined) {
      return false
    }

    const clientId = userId
    let room: ActiveRoom
    try {
      room = await ActiveRoom.createRoom(
        this.twilioManager,
        this._identityMap,
        clientId,
        observerId,
      )
    } catch (error) {
      console.log('There was a problem setting up a new room:')
      console.error(error)
      return false
    }
    const clientTokenPromise = this.twilioManager.getAccessToken(room, 'Client', clientId)
    const observerTokenPromise = this.twilioManager.getAccessToken(room, 'Observer', observerId)
    const [clientToken, observerToken] = await Promise.all([
      clientTokenPromise,
      observerTokenPromise,
    ])

    let clientSendPromise = room.connectParticipant(client, clientToken, this.timeoutFrame)
    let observerSendPromise = room.connectParticipant(observer, observerToken, this.timeoutFrame)
    let success = (await Promise.all([clientSendPromise, observerSendPromise])).reduce(
      (successfulSoFar, successfulThis) => successfulSoFar && successfulThis,
    )

    // TODO: At some point, there should be better logic for handling a disconnected client, such as returning the observer to the queue.
    // The error-handling code following these comments is definitely not ready for production whatsoever.

    if (success) {
      console.log(`Successfully sent participants to ${room.roomName}!`)
      this.activeObservers.add(observer)
      this.memberToRoomMapping.set(client, room)
      this.memberToRoomMapping.set(observer, room)

      // CHANGE TO SUPABASE ACCOUNT NAME, NOT SECURE
      const name = userId
      this.notifyEmergencyContact(name, this.emergencyContatList, coordinates.lat, coordinates.lon)
      return true
    } else {
      console.log(
        `Note: Observer with user ID '${observerId}' not flagged as active due to connection failure!`,
      )
      observer.emit('endCall')
      this.enqueueObserver(observer)
      return false
    }
  }

  public async pullLawyer(observer: UserSocket): Promise<boolean> {
    let lawyerId: string | undefined = undefined
    let lawyer: UserSocket | undefined = undefined
    while (this.waitingLawyers.length > 0) {
      lawyer = this.waitingLawyers.shift()
      console.log(`Removed a lawyer from queue, new length: ${this.waitingLawyers.length}`)
      const id = this._identityMap.userIdOf(lawyer!)
      if (id === undefined) {
        console.log(`Invalid lawyer, skipping...`)
      } else {
        lawyerId = id
        break
      }
    }
    if (lawyerId === undefined || lawyer === undefined) {
      return false
    }

    const room = this.memberToRoomMapping.get(observer)
    if (room === undefined) {
      console.log(`WARNING: Lawyer request from observer who is not in a room {${observer.id}}`)
      return false
    }
    const lawyerToken = await this.twilioManager.getAccessToken(room, 'Lawyer', lawyerId)
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

  public enqueueObserver(observer: UserSocket): UserType {
    this.waitingObservers.push(observer)
    console.log(`Added an observer to queue, new length: ${this.waitingObservers.length}`)
    return 'Observer'
  }

  public enqueueLawyer(lawyer: UserSocket): UserType {
    this.waitingLawyers.push(lawyer)
    console.log(`Added a lawyer to queue, new length: ${this.waitingLawyers.length}`)
    return 'Lawyer'
  }

  public dequeueWorker(worker: UserSocket): boolean {
    let index = -1
    if (
      this.waitingObservers.find((x, i) => {
        index = i
        return x == worker
      }) !== undefined
    ) {
      this.waitingObservers.splice(index, 1)
      console.log(`Removed an observer from queue, new length: ${this.waitingObservers.length}`)
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
    const room = this.memberToRoomMapping.get(user)
    if (room === undefined) {
      console.log(`WARNING: Hang up attempt from member who is not in a room {${user.id}}`)
      return
    }
    ;(async () => {
      ;(await room.endCall(user)).forEach(participant => {
        if (this.activeObservers.has(participant)) {
          this.activeObservers.delete(participant)
          this.enqueueObserver(participant)
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
