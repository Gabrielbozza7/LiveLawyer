import { DefaultEventsMap, Socket } from 'socket.io'
import { ClientToServerEvents, ServerToClientEvents } from './SocketEventDefinitions'
import TwilioManager from '../TwilioManager'

type UserSocket = Socket<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, unknown>

export default class CallCenter {
  private readonly twilioManager: TwilioManager
  private readonly waitingParalegals: UserSocket[]
  private readonly memberToRoomMapping: Map<UserSocket, UserSocket[]>
  private roomNameCounter: number = 0

  constructor(twilioManager: TwilioManager) {
    this.twilioManager = twilioManager
    this.waitingParalegals = []
    this.memberToRoomMapping = new Map()
  }

  public connectClient(client: UserSocket) {
    if (this.waitingParalegals.length !== 0) {
      const roomName = `room${this.roomNameCounter++}`
      const paralegal = this.waitingParalegals.shift()
      const clientToken = this.twilioManager.getAccessToken(roomName)
      const paralegalToken = this.twilioManager.getAccessToken(roomName)
      client.emit('sendToRoom', { token: clientToken, roomName: roomName })
      paralegal.emit('sendToRoom', { token: paralegalToken, roomName: roomName })
      const callMembers = [client, paralegal]
      this.memberToRoomMapping.set(client, callMembers)
      this.memberToRoomMapping.set(paralegal, callMembers)
    } else {
      client.emit('rejectFromNoParalegals')
    }
  }

  public enqueueParalegal(paralegal: UserSocket) {
    this.waitingParalegals.push(paralegal)
    paralegal.emit('notifyParalegalQueueEntry')
  }

  public handleHangUp(user: UserSocket) {
    const pair = this.memberToRoomMapping.get(user)
    pair.forEach(participant => {
      participant.emit('endCall')
      this.memberToRoomMapping.delete(participant)
    })
  }
}
