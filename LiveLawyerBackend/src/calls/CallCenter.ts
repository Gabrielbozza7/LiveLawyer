import { DefaultEventsMap, Socket } from 'socket.io'
import { ClientToServerEvents, ServerToClientEvents } from './SocketEventDefinitions'
import TwilioManager from '../TwilioManager'

type UserSocket = Socket<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, unknown>

export default class CallCenter {
  private readonly twilioManager: TwilioManager
  private readonly waitingParalegals: UserSocket[]
  private readonly activeParalegals: Set<UserSocket>
  private readonly memberToRoomMapping: Map<UserSocket, UserSocket[]>
  private roomNameCounter: number = 0

  constructor(twilioManager: TwilioManager) {
    this.twilioManager = twilioManager
    this.waitingParalegals = []
    this.activeParalegals = new Set()
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
      const callMembers = [client, paralegal]
      this.memberToRoomMapping.set(client, callMembers)
      this.memberToRoomMapping.set(paralegal, callMembers)
    } else {
      client.emit('rejectFromNoParalegals')
    }
  }

  public enqueueParalegal(paralegal: UserSocket) {
    this.waitingParalegals.push(paralegal)
    console.log(`Added a paralegal to queue, new length: ${this.waitingParalegals.length}`)
    paralegal.emit('notifyParalegalQueueEntry')
  }

  public handleHangUp(user: UserSocket) {
    const pair: UserSocket[] | undefined = this.memberToRoomMapping.get(user) // looks like a TypeScript soundness issue?
    if (pair === undefined) {
      console.log(`WARNING: Hang up attempt from member who is not in a room {${user.id}}`)
      return
    }
    pair.forEach(participant => {
      participant.emit('endCall')
      if (this.activeParalegals.has(participant)) {
        this.activeParalegals.delete(participant)
        this.enqueueParalegal(participant)
      }
      this.memberToRoomMapping.delete(participant)
    })
  }
}
