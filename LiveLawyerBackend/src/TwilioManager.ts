// This page was originally based on: https://www.twilio.com/docs/video/tutorials/get-started-with-twilio-video-node-express-server

import dotenv from 'dotenv'
import { resolve } from 'path'
import twilio, { Twilio, jwt } from 'twilio'
import { RoomInstance } from 'twilio/lib/rest/video/v1/room'
import RecordingProcessor from './RecordingProcessor'
import { defaultEnvironmentVariableWithWarning, twilioIdentityFromInfo } from 'livelawyerlibrary'
import { UserType } from 'livelawyerlibrary'
import { getSupabaseClient } from './database/supabase'
import ActiveRoom from './calls/ActiveRoom'
import { ParticipantInstance } from 'twilio/lib/rest/video/v1/room/participant'
import { ConnectedClientIdentity } from './IdentityMap'

const AccessToken = jwt.AccessToken
const VideoGrant = AccessToken.VideoGrant

export default class TwilioManager {
  private readonly _accountSid: string
  private readonly _password: string
  private readonly _apiKeySid: string
  private readonly _apiKeySecret: string

  private readonly _twilioClient: Twilio
  private readonly _recordingProcessor: RecordingProcessor
  private readonly _twilioPhoneNumber: string

  constructor() {
    dotenv.config()
    const path = resolve(process.cwd(), '.env')
    // Authentication for downloading recordings:
    this._accountSid = defaultEnvironmentVariableWithWarning(
      process.env.TWILIO_ACCOUNT_SID,
      'TWILIO_ACCOUNT_SID',
      path,
      'abc',
      true,
    )
    this._password = defaultEnvironmentVariableWithWarning(
      process.env.TWILIO_AUTH_TOKEN,
      'TWILIO_AUTH_TOKEN',
      path,
      'abc',
      true,
    )
    this._twilioPhoneNumber = defaultEnvironmentVariableWithWarning(
      process.env.TWILIO_PHONE_NUMBER,
      'TWILIO_PHONE_NUMBER',
      path,
      'abc',
      true,
    )
    const twilioAuthHeader = `Basic ${Buffer.from(`${this._accountSid}:${this._password}`).toString('base64')}`
    this._recordingProcessor = new RecordingProcessor(this, twilioAuthHeader)
    // Authentication for the REST API:
    this._apiKeySid = defaultEnvironmentVariableWithWarning(
      process.env.TWILIO_API_KEY_SID,
      'TWILIO_API_KEY_SID',
      path,
      'abc',
      true,
    )
    this._apiKeySecret = defaultEnvironmentVariableWithWarning(
      process.env.TWILIO_API_KEY_SECRET,
      'TWILIO_API_KEY_SECRET',
      path,
      'abc',
      true,
    )
    this._twilioClient = twilio(this._apiKeySid, this._apiKeySecret, {
      accountSid: this._accountSid,
    })
  }

  public get recordingProcessor() {
    return this._recordingProcessor
  }

  public async notifyEmergencyContacts(client: ConnectedClientIdentity) {
    const supabase = await getSupabaseClient()
    const { data, error } = await supabase
      .from('User')
      .select('firstName, lastName, contacts:Contact(phoneNumber)')
      .eq('id', client.id)
      .single()
    let name: string
    if (error || data === null) {
      name = 'Someone'
    } else {
      name = `${data.firstName} ${data.lastName}`
    }
    const link = `https://google.com/maps?q=${client.location.lat},${client.location.lon}`
    const message = `🚨 Live Lawyer Alert: ${name} is now in a call for legal counsel. View their location here: ${link}`
    if (data !== null) {
      for (const contact of data.contacts) {
        try {
          await this._twilioClient.messages.create({
            body: message,
            from: this._twilioPhoneNumber,
            to: contact.phoneNumber,
          })
        } catch (error) {
          console.log('An error occurred while trying to send an emergency contact notification:')
          console.error(error)
        }
      }
    }
  }

  public async findOrCreateRoom(roomName: string): Promise<RoomInstance> {
    try {
      // Throwing error with code 20404 if the room already exists:
      return await this._twilioClient.video.v1.rooms(roomName).fetch()
    } catch (error) {
      // Creating the room because it was not found:
      if ((error as { code: number }).code == 20404) {
        return await this._twilioClient.video.v1.rooms.create({
          uniqueName: roomName,
          type: 'group',
          emptyRoomTimeout: 1,
          recordParticipantsOnConnect: true,
        })
      } else {
        // Letting other errors bubble up:
        throw error
      }
    }
  }

  public async downloadParticipant(
    roomSid: string,
    participantSid: string,
  ): Promise<ParticipantInstance> {
    return await this._twilioClient.video.v1.rooms(roomSid).participants(participantSid).fetch()
  }

  public async getAccessToken(
    room: ActiveRoom,
    userType: UserType,
    userId: string,
  ): Promise<string> {
    const timestamp = new Date().toISOString()
    const supabase = await getSupabaseClient()
    const { error } = await supabase
      .from('CallEvent')
      .insert({
        callId: room.callId,
        userId,
        action: 'Token Issued',
        timestamp,
      })
      .single()
    if (error) {
      console.log(`Critical error: Unable to document call event (Token Issued): ${error.message}`)
    }

    // Creating an access token and room-specific video grant:
    const token = new AccessToken(this._accountSid, this._apiKeySid, this._apiKeySecret, {
      identity: twilioIdentityFromInfo({ userId, userType }),
    })
    token.addGrant(new VideoGrant({ room: room.roomName }))
    console.log(`Created token for user with ID '${userId}' for ${room.roomName}!`)

    // Returning that access token as a JWT:
    return token.toJwt()
  }
}
