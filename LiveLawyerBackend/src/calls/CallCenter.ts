import TwilioManager from '../TwilioManager'
import ActiveRoom from './ActiveRoom'
import IdentityMap, {
  ConnectedClientIdentity,
  ConnectedLawyerIdentity,
  ConnectedObserverIdentity,
  ConnectedUserIdentity,
} from '../IdentityMap'
import { getSupabaseClient } from '../database/supabase'
import Queues from './Queues'

export default class CallCenter {
  private readonly _identityMap: IdentityMap
  private readonly _twilioManager: TwilioManager
  private readonly _queues: Queues
  private readonly timeoutFrame: number = 5000

  constructor(twilioManager: TwilioManager, identityMap: IdentityMap) {
    this._identityMap = identityMap
    this._twilioManager = twilioManager
    this._queues = new Queues()
  }

  // Handler for event: 'joinAsClient'
  public async joinAsClient(
    client: ConnectedClientIdentity,
  ): Promise<'OK' | 'ALREADY_IN_ROOM' | 'NO_OBSERVERS'> {
    if (client.room !== null) {
      return 'ALREADY_IN_ROOM'
    }
    let observer: ConnectedObserverIdentity | undefined = undefined
    while (true) {
      observer = this._queues.dequeueObserver()
      if (observer === undefined) {
        break
      }
      if (observer.room !== null) {
        console.log(`WARNING: Found busy observer when trying to dequeue an observer, skipping...`)
        continue
      }
      break
    }
    if (observer === undefined) {
      return 'NO_OBSERVERS'
    }
    let room: ActiveRoom
    try {
      room = await ActiveRoom.createRoom(this._twilioManager, this._identityMap, client, observer)
    } catch (error) {
      console.log('There was a problem setting up a new room:')
      console.error(error)
      // TODO: Put an actual error code here.
      return 'NO_OBSERVERS'
    }
    const clientTokenPromise = this._twilioManager.getAccessToken(room, 'Client', client.id)
    const observerTokenPromise = this._twilioManager.getAccessToken(room, 'Observer', observer.id)
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
      this._twilioManager.notifyEmergencyContacts(client)
      return 'OK'
    } else {
      console.log(
        `Note: Observer with user ID '${observer.id}' not flagged as active due to connection failure!`,
      )
      observer.socket.emit('endCall')
      this._queues.enqueue(observer)
      // TODO: Put an actual error code here.
      return 'NO_OBSERVERS'
    }
  }

  // Handler for event: 'enqueue'
  public enqueue(
    worker: ConnectedObserverIdentity | ConnectedLawyerIdentity,
  ): 'OK' | 'ALREADY_IN_QUEUE' {
    return this._queues.enqueue(worker) ? 'OK' : 'ALREADY_IN_QUEUE'
  }

  // Handler for event 'exitQueue'
  public exitQueue(
    worker: ConnectedObserverIdentity | ConnectedLawyerIdentity,
  ): 'OK' | 'NOT_IN_QUEUE' {
    return this._queues.kick(worker) ? 'OK' : 'NOT_IN_QUEUE'
  }

  // Handler for event 'summonLawyer'
  public async summonLawyer(
    observer: ConnectedObserverIdentity,
  ): Promise<'OK' | 'NOT_IN_ROOM' | 'NO_LAWYERS'> {
    if (observer.room === null) {
      return 'NOT_IN_ROOM'
    }
    const room = observer.room
    const state = room.client.state
    let lawyer: ConnectedLawyerIdentity | undefined = undefined
    while (true) {
      lawyer = this._queues.dequeueLawyer(state)
      if (lawyer === undefined) {
        break
      }
      if (lawyer.room !== null) {
        console.log(`WARNING: Found busy lawyer when trying to dequeue a lawyer, skipping...`)
        continue
      }
      break
    }
    if (lawyer === undefined) {
      return 'NO_LAWYERS'
    }
    const lawyerToken = await this._twilioManager.getAccessToken(room, 'Lawyer', lawyer?.id)
    let success: boolean = await room.connectParticipant(lawyer, lawyerToken, this.timeoutFrame)

    // TODO: At some point, there should be better logic for handling a failed lawyer connection.
    // The error-handling code following these comments is definitely not ready for production whatsoever.

    if (success) {
      const supabase = await getSupabaseClient()
      const { error } = await supabase
        .from('CallMetadata')
        .update({ lawyerId: lawyer.id })
        .eq('id', room.callId)
        .single()
      if (error) {
        console.log(
          `Critical error: Unable to associate lawyer with call in ${room.roomName}: ${error.message}`,
        )
      }
      return 'OK'
    } else {
      console.log(
        `Note: Lawyer with user ID '${lawyer.id}' not flagged as active due to connection failure!`,
      )
      // TODO: Put an actual error code here.
      return 'NO_LAWYERS'
    }
  }

  // Handler for event: 'hangUp'
  public hangUp(user: ConnectedUserIdentity): 'OK' | 'NOT_IN_ROOM' | 'CALL_ALREADY_ENDED' {
    if (user.room === null) {
      return 'NOT_IN_ROOM'
    }
    if (user.room.startedEndSequence) {
      return 'CALL_ALREADY_ENDED'
    }
    user.room.endCall(user).then(removedParticipants => {
      removedParticipants.forEach(participant => {
        participant.socket.emit('endCall')
        participant.room = null
        console.log('Q: ' + participant.type)
        if (participant.type === 'Observer' || participant.type === 'Lawyer') {
          console.log('U: ' + participant.type)
          this._queues.enqueue(participant)
        }
      })
    })
    return 'OK'
  }
}
