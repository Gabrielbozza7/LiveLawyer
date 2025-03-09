// Most of the code on this page is from: https://www.twilio.com/docs/video/tutorials/get-started-with-twilio-video-node-express-server

import dotenv from 'dotenv'
import twilio from 'twilio'
import { v4 as uuidv4 } from 'uuid'
import { Express } from 'express'

const AccessToken = twilio.jwt.AccessToken
const VideoGrant = AccessToken.VideoGrant

export default class TwilioManager {
  private readonly twilioClient: twilio.Twilio

  constructor() {
    dotenv.config()
    this.twilioClient = twilio(process.env.TWILIO_API_KEY_SID, process.env.TWILIO_API_KEY_SECRET, {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
    })
  }

  public async findOrCreateRoom(roomName: string): Promise<void> {
    try {
      // see if the room exists already. If it doesn't, this will throw
      // error 20404.
      await this.twilioClient.video.v1.rooms(roomName).fetch()
    } catch (error) {
      // the room was not found, so create it
      if (error.code == 20404) {
        await this.twilioClient.video.v1.rooms.create({
          uniqueName: roomName,
          type: 'group',
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
    // serialize the token and return it
    return token.toJwt()
  }

  public setupPostRoute(app: Express): void {
    // For this next line, I have no idea how to get this to work with the type system. Feel free to change it if you know a way.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    app.post('/join-room', async (req: any, res: any) => {
      // return 400 if the request has an empty body or no roomName
      if (!req.body || !req.body.roomName) {
        return res.status(400).send('Must include roomName argument.')
      }
      const roomName = req.body.roomName
      // find or create a room with the given roomName
      this.findOrCreateRoom(roomName)
      // generate an Access Token for a participant in this room
      const token = this.getAccessToken(roomName)
      res.send({
        token: token,
      })
    })
  }
}
