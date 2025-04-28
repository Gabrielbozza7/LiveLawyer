// Most of the code on this page is from: https://www.twilio.com/docs/video/tutorials/get-started-with-twilio-video-node-express-server

import dotenv from 'dotenv'
import twilio, { Twilio, jwt } from 'twilio'
import { RoomInstance } from 'twilio/lib/rest/video/v1/room'
import { v4 as uuidv4 } from 'uuid'
import RecordingProcessor from './RecordingProcessor'

const AccessToken = jwt.AccessToken
const VideoGrant = AccessToken.VideoGrant

export default class TwilioManager {
  private readonly _twilioClient: Twilio
  private readonly _recordingProcessor: RecordingProcessor

  constructor() {
    dotenv.config()
    this._twilioClient = twilio(process.env.TWILIO_API_KEY_SID, process.env.TWILIO_API_KEY_SECRET, {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
    })
    const twilioAuthHeader = `Basic ${Buffer.from(
      `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`,
    ).toString('base64')}`
    console.log(twilioAuthHeader)
    this._recordingProcessor = new RecordingProcessor(twilioAuthHeader)
  }

  public get recordingProcessor() {
    return this._recordingProcessor
  }

  public async findOrCreateRoom(roomName: string): Promise<RoomInstance> {
    try {
      // see if the room exists already. If it doesn't, this will throw
      // error 20404.
      await this._twilioClient.video.v1.rooms(roomName).fetch()
    } catch (error) {
      // the room was not found, so create it
      if (error.code == 20404) {
        return await this._twilioClient.video.v1.rooms.create({
          uniqueName: roomName,
          type: 'group',
          emptyRoomTimeout: 1,
          recordParticipantsOnConnect: true,
        })
      } else {
        // let other errors bubble up
        throw error
      }
    }
  }

  public getAccessToken(roomName: string): string {
    // create an access token
    const token = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_API_KEY_SID,
      process.env.TWILIO_API_KEY_SECRET,
      // generate a random unique identity for this participant
      { identity: uuidv4() },
    )
    // create a video grant for this specific room
    const videoGrant = new VideoGrant({
      room: roomName,
    })

    // add the video grant
    token.addGrant(videoGrant)
    console.log('Handed out a token!')
    // serialize the token and return it
    return token.toJwt()
  }
}
