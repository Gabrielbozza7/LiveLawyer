import fs from 'fs/promises'
import path from 'path'
import { RoomRecordingInstance } from 'twilio/lib/rest/video/v1/room/roomRecording'
import { getSupabaseClient } from './database/supabase'
import TwilioManager from './TwilioManager'

export const RECORDING_DIR_NAME = path.resolve('.', 'temp-recordings')

interface DownloadInfo {
  recording: RoomRecordingInstance
  callId: string
}

interface UploadInfo {
  metadataBeforeDelete: RoomRecordingInstance
  recordedTrackBuffer: Buffer<ArrayBufferLike>
  callId: string
  userId: string
}

export default class RecordingProcessor {
  private readonly _twilioManager: TwilioManager
  private readonly _twilioAuthHeader: string
  private _isDownloadingActive: boolean
  private readonly _downloadQueue: DownloadInfo[]
  private _isUploadingActive: boolean
  private readonly _uploadQueue: UploadInfo[]

  constructor(twilioManager: TwilioManager, twilioAuthHeader: string) {
    this._twilioManager = twilioManager
    this._twilioAuthHeader = twilioAuthHeader
    this._isDownloadingActive = false
    this._downloadQueue = []
    this._isUploadingActive = false
    this._uploadQueue = []
  }

  public downloadRecording(newDownloadInfo: DownloadInfo) {
    this._downloadQueue.push(newDownloadInfo)
    if (!this._isDownloadingActive) {
      this._isDownloadingActive = true
      ;(async () => {
        await this._processDownloadQueue()
        this._isDownloadingActive = false
      })()
    }
  }

  private async _processDownloadQueue() {
    while (this._downloadQueue.length > 0) {
      let downloadInfo = this._downloadQueue.shift()
      let recording = downloadInfo.recording
      let ignoringDownload = false
      while (recording.status !== 'completed') {
        console.log(
          `Recording with SID OF ${recording.sid} not ready yet, will check again in 5 seconds...`,
        )
        await new Promise(resolve => setTimeout(resolve, 5000))
        recording = await recording.fetch()
        if (recording.status === 'deleted' || recording.status === 'failed') {
          console.log(
            `ERROR: Recording with SID of ${recording.sid} has unexpected status "${recording.status}", ignoring!`,
          )
          ignoringDownload = true
          break
        } else if (recording.type === 'data') {
          console.log(
            `Ignoring recording with SID of ${recording.sid} due to it being a data track`,
          )
          ignoringDownload = true
          break
        }
      }
      if (ignoringDownload) continue
      // Attempting to download recording and participant info now:
      const downloadParticipant = async (): Promise<string> => {
        // NOTE: This download should be cached eventually; a participant usually has two tracks.
        const participant = await this._twilioManager.downloadParticipant(
          recording.roomSid,
          // This cast is needed because the library's types aren't detailed enough.
          recording.groupingSids.participant_sid as unknown as string,
        )
        return participant.identity.split(' ')[1]
      }
      const downloadRecording = async (): Promise<Buffer<ArrayBufferLike> | undefined> => {
        const requestHeaders = new Headers()
        requestHeaders.append('Authorization', this._twilioAuthHeader)
        const response = await fetch(`${recording.url}/Media`, {
          method: 'GET',
          headers: requestHeaders,
          redirect: 'follow',
        })
        if (!response.ok) {
          console.log(
            `ERROR: Recording with SID of ${recording.sid} failed to download with code ${response.status}, ignoring!`,
          )
          return undefined
        }
        const destination = path.resolve(
          RECORDING_DIR_NAME,
          `${recording.sid}.${recording.containerFormat}`,
        )
        const responseArrayBuffer = await response.arrayBuffer()
        await recording.remove()
        await fs.writeFile(destination, Buffer.from(responseArrayBuffer))
        return await fs.readFile(destination)
      }
      const downloadParticipantPromise = downloadParticipant()
      const downloadRecordingPromise = downloadRecording()
      const [userId, buffer] = await Promise.all([
        downloadParticipantPromise,
        downloadRecordingPromise,
      ])
      if (buffer === undefined) {
        continue
      }

      this._uploadRecording({
        metadataBeforeDelete: recording,
        recordedTrackBuffer: buffer,
        callId: downloadInfo.callId,
        userId,
      })
    }
  }

  private _uploadRecording(newUploadInfo: UploadInfo) {
    this._uploadQueue.push(newUploadInfo)
    if (!this._isUploadingActive) {
      this._isUploadingActive = true
      ;(async () => {
        await this._processUploadQueue()
        this._isUploadingActive = false
      })()
    }
  }

  private async _processUploadQueue() {
    const supabase = await getSupabaseClient()
    while (this._uploadQueue.length > 0) {
      let uploadInfo = this._uploadQueue.shift()
      // Uploading call to bucket:
      const { data: storageData, error: storageError } = await supabase.storage
        .from('call-recordings')
        .upload(
          `${uploadInfo.metadataBeforeDelete.roomSid}/${uploadInfo.metadataBeforeDelete.sid}.${uploadInfo.metadataBeforeDelete.containerFormat}`,
          uploadInfo.recordedTrackBuffer,
        )
      if (storageError) {
        console.log(storageError)
      }
      // Uploading recording record to database:
      const { error: databaseError } = await supabase
        .from('CallRecording')
        .insert({
          callId: uploadInfo.callId,
          userId: uploadInfo.userId,
          startTime: uploadInfo.metadataBeforeDelete.dateCreated.toISOString(),
          trackType: uploadInfo.metadataBeforeDelete.type === 'video' ? 'Video' : 'Audio',
          s3Ref: storageData.fullPath,
        })
        .single()
      if (databaseError) {
        console.log(`Critical error: Unable to upload recording record: ${databaseError.message}`)
      }
      //TODO: Delete video from local machine. Only if no error uploading.
      const destination = path.resolve(
        RECORDING_DIR_NAME,
        `${uploadInfo.metadataBeforeDelete.sid}.${uploadInfo.metadataBeforeDelete.containerFormat}`,
      )
      fs.unlink(destination)
    }
  }
}
