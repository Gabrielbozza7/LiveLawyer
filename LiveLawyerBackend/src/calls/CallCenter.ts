import { DefaultEventsMap, Socket } from 'socket.io'
import { ClientToServerEvents, ServerToClientEvents, UserType } from './SocketEventDefinitions'
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
  private readonly timeoutFrame: number = 5000
  private roomNameCounter: number = 0

  constructor(twilioManager: TwilioManager) {
    this.twilioManager = twilioManager
    this.waitingParalegals = []
    this.waitingLawyers = []
    this.activeParalegals = new Set()
    this.activeLawyers = new Set()
    this.memberToRoomMapping = new Map()
  }

  public async connectClient(client: UserSocket): Promise<boolean> {
    if (this.waitingParalegals.length !== 0) {
      const roomName = `room${this.roomNameCounter++}`
      const paralegal = this.waitingParalegals.shift()
      console.log(`Removed a paralegal from queue, new length: ${this.waitingParalegals.length}`)

      const clientToken = this.twilioManager.getAccessToken(roomName)
      const paralegalToken = this.twilioManager.getAccessToken(roomName)
      
      try{
        // Wait for both client and paralegal to ack
        await Promise.all([
          client.timeout(this.timeoutFrame).emitWithAck('sendToRoom',{token:clientToken,roomName}),
          paralegal.timeout(this.timeoutFrame).emitWithAck('sendToRoom',{token:paralegalToken,roomName}),
        ])
      // proceed if both acknowledged
      this.activeParalegals.add(paralegal)
      const participants = [client, paralegal]
      const room: ActiveRoom = { roomName: roomName, participants: participants }
      this.memberToRoomMapping.set(client, room)
      this.memberToRoomMapping.set(paralegal, room)
      return true
      } catch (err){
        console.error("One or both parties did not acknowlede sendToRoom in given time.",err)
        console.log('Reconnecting after 1 second ')
        // Wait 1 second and retry connecting
        await new Promise(res => setTimeout(res,1000))
        try{
          // Wait for both client and paralegal to ack
          await Promise.all([
            client.timeout(this.timeoutFrame).emitWithAck('sendToRoom',{token:clientToken,roomName}),
            paralegal.timeout(this.timeoutFrame).emitWithAck('sendToRoom',{token:paralegalToken,roomName}),
          ])
        // proceed if both acknowledged
        this.activeParalegals.add(paralegal)
        const participants = [client, paralegal]
        const room: ActiveRoom = { roomName: roomName, participants: participants }
        this.memberToRoomMapping.set(client, room)
        this.memberToRoomMapping.set(paralegal, room)
        return true
        } catch (err){
          console.log("Retrying failed")
          console.error("One or both parties did not acknowlede sendToRoom in given time.",err)
          return false
        }   
      }
    } else {
      return false
    }
  }

  public async pullLawyer(paralegal: UserSocket): Promise<boolean> {
    if (this.waitingLawyers.length !== 0) {
      const room: ActiveRoom | undefined = this.memberToRoomMapping.get(paralegal)
      if (room === undefined) {
        console.log(`WARNING: Lawyer request from paralegal who is not in a room {${paralegal.id}}`)
        return
      }
      const lawyer = this.waitingLawyers.shift()
      console.log(`Removed a lawyer from queue, new length: ${this.waitingLawyers.length}`)
      const lawyerToken = this.twilioManager.getAccessToken(room.roomName)
      try{
        await lawyer.timeout(this.timeoutFrame).emitWithAck('sendToRoom', { token: lawyerToken, roomName: room.roomName })
        this.activeLawyers.add(lawyer)
        room.participants.push(lawyer)
        this.memberToRoomMapping.set(lawyer, room)
        return true

      } catch(err){
        console.log('Lawyer did not acknowledge sendToRoom:',err)
        console.log('Lawyer Reconnecting after 1 second')
        // Wait 1 second and retry connecting
        await new Promise(res => setTimeout(res,1000))
        try{
          await lawyer.timeout(this.timeoutFrame).emitWithAck('sendToRoom', { token: lawyerToken, roomName: room.roomName })
          this.activeLawyers.add(lawyer)
          room.participants.push(lawyer)
          this.memberToRoomMapping.set(lawyer, room)
          return true
        } catch (err){
          console.log('Retrying failed')
          console.log('Lawyer did not acknowledge sendToRoom:',err)
          return false
        }
      }    
    } else {
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
