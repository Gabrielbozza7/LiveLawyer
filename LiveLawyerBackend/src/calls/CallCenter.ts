import { DefaultEventsMap, Socket } from 'socket.io'
import { ClientToServerEvents, ServerToClientEvents } from './SocketEventDefinitions'
import TwilioManager from '../TwilioManager'
import ActiveRoom from './ActiveRoom'

type UserSocket = Socket<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, unknown>

export default class CallCenter {
  private readonly twilioManager: TwilioManager
  private readonly waitingParalegals: UserSocket[]
  private readonly waitingLawyers: UserSocket[]
  private readonly activeParalegals: Set<UserSocket>
  private readonly activeLawyers: Set<UserSocket>
  private readonly memberToRoomMapping: Map<UserSocket, ActiveRoom>
  private roomNameCounter: number = 0

  constructor(twilioManager: TwilioManager) {
    this.twilioManager = twilioManager
    this.waitingParalegals = []
    this.waitingLawyers = []
    this.activeParalegals = new Set()
    this.activeLawyers = new Set()
    this.memberToRoomMapping = new Map()
  }

  public connectClient(client: UserSocket) {
    if (this.waitingParalegals.length !== 0) {
      const roomName = `room${this.roomNameCounter++}`
      const paralegal = this.waitingParalegals.shift()
      console.log(`Removed a paralegal from queue, new length: ${this.waitingParalegals.length}`)
      const clientToken = this.twilioManager.getAccessToken(roomName)
      const paralegalToken = this.twilioManager.getAccessToken(roomName)
      client.emit('sendToRoom', { token: clientToken, roomName: roomName })
      paralegal.emit('sendToRoom', { token: paralegalToken, roomName: roomName })
      this.activeParalegals.add(paralegal)
      const participants = [client, paralegal]
      const room: ActiveRoom = { roomName: roomName, participants: participants }
      this.memberToRoomMapping.set(client, room)
      this.memberToRoomMapping.set(paralegal, room)
    } else {
      client.emit('rejectFromNoParalegals')
    }
  }

  public pullLawyer(paralegal: UserSocket) {
    if (this.waitingLawyers.length !== 0) {
      const room: ActiveRoom | undefined = this.memberToRoomMapping.get(paralegal)
      if (room === undefined) {
        console.log(`WARNING: Lawyer request from paralegal who is not in a room {${paralegal.id}}`)
        return
      }
      const lawyer = this.waitingLawyers.shift()
      console.log(`Removed a lawyer from queue, new length: ${this.waitingLawyers.length}`)
      const lawyerToken = this.twilioManager.getAccessToken(room.roomName)
      lawyer.emit('sendToRoom', { token: lawyerToken, roomName: room.roomName })
      this.activeLawyers.add(lawyer)
      room.participants.push(lawyer)
      this.memberToRoomMapping.set(lawyer, room)
    } else {
      paralegal.emit('rejectFromNoLawyers')
    }
  }

  public enqueueParalegal(paralegal: UserSocket) {
    this.waitingParalegals.push(paralegal)
    console.log(`Added a paralegal to queue, new length: ${this.waitingParalegals.length}`)
    paralegal.emit('notifyQueueEntry', { userType: 'PARALEGAL' })
  }

  public enqueueLawyer(lawyer: UserSocket) {
    this.waitingLawyers.push(lawyer)
    console.log(`Added a lawyer to queue, new length: ${this.waitingLawyers.length}`)
    lawyer.emit('notifyQueueEntry', { userType: 'LAWYER' })
  }

  public dequeueWorker(worker: UserSocket) {
    let index: number
    if (
      this.waitingParalegals.find((x, i) => {
        index = i
        return x == worker
      }) !== undefined
    ) {
      this.waitingParalegals.splice(index, 1)
      console.log(`Removed a paralegal from queue, new length: ${this.waitingParalegals.length}`)
      worker.emit('notifyQueueExit')
    } else if (
      this.waitingLawyers.find((x, i) => {
        index = i
        return x == worker
      }) !== undefined
    ) {
      this.waitingLawyers.splice(index, 1)
      console.log(`Removed a lawyer from queue, new length: ${this.waitingLawyers.length}`)
      worker.emit('notifyQueueExit')
    } else {
      console.log(`WARNING: Unable to dequeue {${worker.id}} due to not existing in a queue!`)
    }
  }

  public handleHangUp(user: UserSocket) {
    const room: ActiveRoom | undefined = this.memberToRoomMapping.get(user) // looks like a TypeScript soundness issue?
    if (room === undefined) {
      console.log(`WARNING: Hang up attempt from member who is not in a room {${user.id}}`)
      return
    }
    room.participants.forEach(participant => {
      participant.emit('endCall')
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
  }
}
