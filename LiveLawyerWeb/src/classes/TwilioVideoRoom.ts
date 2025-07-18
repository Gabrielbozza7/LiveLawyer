import { Dispatch, SetStateAction } from 'react'
import { connect, Room, Participant, LocalParticipant } from 'twilio-video'

export default class TwilioVideoRoom {
  private room: Room | undefined
  private allParticipants: Participant[]
  private setParticipants: Dispatch<SetStateAction<Participant[]>> | undefined

  constructor() {
    this.room = undefined
    this.allParticipants = []
    this.setParticipants = undefined
  }

  public async joinRoom(token: string, roomName: string): Promise<boolean> {
    try {
      this.room = await connect(token, {
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

  /**
   * Sets up listeners to modify the participant array. The caller should attach the returned callback
   * for platform-specific disconnection triggers.
   * @param setParticipants The participant array updater
   * @returns The local paticipant and a callback to be used for disconnecting from the call based on other events
   */
  public setupListeners(
    setParticipants: Dispatch<SetStateAction<Participant[]>>,
  ): [() => Promise<void>, LocalParticipant] {
    if (this.room === undefined) {
      throw new Error("Cannot setup listeners if a room hasn't been joined!")
    }
    this.setParticipants = setParticipants

    this.allParticipants = [this.room.localParticipant]
    this.room.participants.forEach(participant => {
      this.allParticipants.push(participant)
    })
    this.room.on('participantConnected', participant => {
      this.allParticipants.push(participant)
      setParticipants([...this.allParticipants])
    })
    setParticipants([...this.allParticipants])
    return [() => this.disconnect(), this.room.localParticipant]
  }

  public receiveDisconnection(participant: Participant) {
    if (this.setParticipants === undefined) {
      throw new Error('Participant-change callback undefined!')
    }
    this.allParticipants.splice(
      this.allParticipants.findIndex(value => value == participant),
      1,
    )
    this.setParticipants([...this.allParticipants])
  }
}
