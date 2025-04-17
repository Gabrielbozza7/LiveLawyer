// Most of the code on this page is from: https://www.twilio.com/docs/video/tutorials/get-started-with-twilio-video-node-express-server

import dotenv from 'dotenv'
import twilio, { Twilio, jwt } from 'twilio'
import { RoomInstance } from 'twilio/lib/rest/video/v1/room'
import { v4 as uuidv4 } from 'uuid'

const AccessToken = jwt.AccessToken
const VideoGrant = AccessToken.VideoGrant

export default class TwilioManager {
  private readonly twilioClient: Twilio

  constructor() {
    dotenv.config()
    this.twilioClient = twilio(process.env.TWILIO_API_KEY_SID, process.env.TWILIO_API_KEY_SECRET, {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
    })
  }

  public async findOrCreateRoom(roomName: string): Promise<RoomInstance> {
    try {
      // see if the room exists already. If it doesn't, this will throw
      // error 20404.
      await this.twilioClient.video.v1.rooms(roomName).fetch()
    } catch (error) {
      // the room was not found, so create it
      if (error.code == 20404) {
        return await this.twilioClient.video.v1.rooms.create({
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
