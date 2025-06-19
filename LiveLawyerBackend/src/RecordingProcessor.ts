import fs from 'fs/promises'
import path from 'path'
import { RoomRecordingInstance } from 'twilio/lib/rest/video/v1/room/roomRecording'
import { getSupabaseClient } from './database/supabase'

export const RECORDING_DIR_NAME = path.resolve('.', 'temp-recordings')

interface UploadInfo {
  metadataBeforeDelete: RoomRecordingInstance
  recordedTrackBuffer: Buffer<ArrayBufferLike>
}

export default class RecordingProcessor {
  private readonly _twilioAuthHeader: string
  private _isDownloadingActive: boolean
  private readonly _downloadQueue: RoomRecordingInstance[]
  private _isUploadingActive: boolean
  private readonly _uploadQueue: UploadInfo[]

  constructor(twilioAuthHeader: string) {
    this._twilioAuthHeader = twilioAuthHeader
    this._isDownloadingActive = false
    this._downloadQueue = []
    this._isUploadingActive = false
    this._uploadQueue = []
  }

  public downloadRecording(newRecording: RoomRecordingInstance) {
    this._downloadQueue.push(newRecording)
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
      let recording = this._downloadQueue.shift()
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
        }
      }
      if (ignoringDownload) continue
      // Attempt to download video now:
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
        continue
      }
      const destination = path.resolve(
        RECORDING_DIR_NAME,
        `${recording.sid}.${recording.containerFormat}`,
      )
      const responseArrayBuffer = await response.arrayBuffer()
      await recording.remove()
      let mode: 'FROM_FILE' | 'FROM_RESPONSE' = 'FROM_FILE'
      let buffer = await (async () => {
        if (mode === 'FROM_FILE') {
          await fs.writeFile(destination, Buffer.from(responseArrayBuffer))
          return await fs.readFile(destination)
        } else if (mode === 'FROM_RESPONSE') {
          return Buffer.from(responseArrayBuffer)
        }
      })()
      this._uploadRecording({ metadataBeforeDelete: recording, recordedTrackBuffer: buffer })
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
    //Log in Backend account
    const supabase = await getSupabaseClient()
    while (this._uploadQueue.length > 0) {
      let uploadInfo = this._uploadQueue.shift()
      //Upload call to bucket
      const { data, error } = await supabase.storage
        .from('call-recordings')
        .upload(
          `${uploadInfo.metadataBeforeDelete.roomSid}/${uploadInfo.metadataBeforeDelete.sid}.${uploadInfo.metadataBeforeDelete.containerFormat}`,
          uploadInfo.recordedTrackBuffer,
        )
      if (error) {
        console.log(error)
      } else {
        console.log(data)
        //TODO: Delete video from local machine. Only if no error uploading.
        const destination = path.resolve(
          RECORDING_DIR_NAME,
          `${uploadInfo.metadataBeforeDelete.sid}.${uploadInfo.metadataBeforeDelete.containerFormat}`,
        )
        fs.unlink(destination)
      }
      console.log(
        `Note that the recording was deleted from Twilio, but this is its visible status: ${uploadInfo.metadataBeforeDelete.status}`,
      )
    }
  }
}
