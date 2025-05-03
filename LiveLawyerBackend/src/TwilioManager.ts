// This page was originally based on: https://www.twilio.com/docs/video/tutorials/get-started-with-twilio-video-node-express-server

import dotenv from 'dotenv'
import { resolve } from 'path'
import twilio, { Twilio, jwt } from 'twilio'
import { RoomInstance } from 'twilio/lib/rest/video/v1/room'
import RecordingProcessor from './RecordingProcessor'
import { defaultEnvironmentVariableWithWarning } from 'livelawyerlibrary'
import { UserType } from 'livelawyerlibrary/SocketEventDefinitions'

const AccessToken = jwt.AccessToken
const VideoGrant = AccessToken.VideoGrant

export default class TwilioManager {
  private readonly _accountSid: string
  private readonly _password: string
  private readonly _apiKeySid: string
  private readonly _apiKeySecret: string

  private readonly _twilioClient: Twilio
  private readonly _recordingProcessor: RecordingProcessor

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
    const twilioAuthHeader = `Basic ${Buffer.from(`${this._accountSid}:${this._password}`).toString('base64')}`
    this._recordingProcessor = new RecordingProcessor(twilioAuthHeader)
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

  public async findOrCreateRoom(roomName: string): Promise<RoomInstance> {
    try {
      // Throwing error with code 20404 if the room already exists:
      await this._twilioClient.video.v1.rooms(roomName).fetch()
    } catch (error) {
      // Creating the room because it was not found:
      if (error.code == 20404) {
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

  public getAccessToken(roomName: string, userType: UserType, userId: string): string {
    // Creating an access token and room-specific video grant:
    const token = new AccessToken(this._accountSid, this._apiKeySid, this._apiKeySecret, {
      identity: `${userType} ${userId}`,
    })
    token.addGrant(new VideoGrant({ room: roomName }))
    console.log(`Created token for user with ID ${userId} for ${roomName}!`)

    // Returning that access token as a JWT:
    return token.toJwt()
  }
}
