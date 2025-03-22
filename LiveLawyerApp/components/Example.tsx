// Modified from https://github.com/blackuy/react-native-twilio-video-webrtc/blob/master/Example/index.js

/*
The MIT License (MIT)

Copyright (c) 2016-2024 Gaston Morixe <gaston@gastonmorixe.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/* eslint-disable react-native/no-inline-styles */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useRef } from 'react'
import {
  AppRegistry,
  StyleSheet,
  Text,
  TextInput,
  View,
  Button,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
} from 'react-native'

import {
  TwilioVideoLocalView,
  TwilioVideoParticipantView,
  TwilioVideo,
} from 'react-native-twilio-video-webrtc'

export default function Example({ token }: { token: string }) {
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(true)
  const [isSharing, setIsSharing] = useState<boolean>(true)
  const [isScreenShareEnabled, setIsScreenShareEnabled] = useState<boolean>(false)
  const [status, setStatus] = useState('disconnected')
  const [participants, setParticipants] = useState(new Map())
  const [videoTracks, setVideoTracks] = useState(new Map())
  const twilioVideo = useRef<TwilioVideo>(null)

  const _onConnectButtonPress = async () => {
    if (Platform.OS === 'android') {
      await _requestAudioPermission()
      await _requestCameraPermission()
    }
    twilioVideo.current!.connect({
      accessToken: token,
      enableNetworkQualityReporting: true,
      dominantSpeakerEnabled: true,
    })
    setStatus('connecting')
  }

  const _onEndButtonPress = () => {
    twilioVideo.current!.disconnect()
  }

  const _onMuteButtonPress = () => {
    twilioVideo
      .current!.setLocalAudioEnabled(!isAudioEnabled)
      .then(isEnabled => setIsAudioEnabled(isEnabled))
  }

  const _onShareButtonPressed = () => {
    ;(twilioVideo.current! as any).toggleScreenSharing(!isSharing)
    setIsSharing(!isSharing)
  }

  const _onFlipButtonPress = () => {
    twilioVideo.current!.flipCamera()
  }

  const _onRoomDidConnect = () => {
    setStatus('connected')
  }

  const _onRoomDidDisconnect = ({ error }: { error: any }) => {
    console.log('ERROR: ', error)

    setStatus('disconnected')
  }

  const _onRoomDidFailToConnect = (error: any) => {
    console.log('ERROR: ', error)

    setStatus('disconnected')
  }

  const _onParticipantAddedVideoTrack = ({
    participant,
    track,
  }: {
    participant: any
    track: any
  }) => {
    console.log('onParticipantAddedVideoTrack: ', participant, track)

    setVideoTracks(originalVideoTracks => {
      originalVideoTracks.set(track.trackSid, {
        participantSid: participant.sid,
        videoTrackSid: track.trackSid,
      })
      return new Map(originalVideoTracks)
    })
  }

  const _onParticipantRemovedVideoTrack = ({
    participant,
    track,
  }: {
    participant: any
    track: any
  }) => {
    console.log('onParticipantRemovedVideoTrack: ', participant, track)

    setVideoTracks(originalVideoTracks => {
      originalVideoTracks.delete(track.trackSid)
      return new Map(originalVideoTracks)
    })
  }

  const _onNetworkLevelChanged = ({
    participant,
    isLocalUser,
    quality,
  }: {
    participant: any
    isLocalUser: any
    quality: any
  }) => {
    console.log('Participant', participant, 'isLocalUser', isLocalUser, 'quality', quality)
  }

  const _onDominantSpeakerDidChange = ({
    roomName,
    roomSid,
    participant,
  }: {
    roomName: any
    roomSid: any
    participant: any
  }) => {
    console.log(
      'onDominantSpeakerDidChange',
      `roomName: ${roomName}`,
      `roomSid: ${roomSid}`,
      'participant:',
      participant,
    )
  }

  const _requestAudioPermission = () => {
    return PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, {
      title: 'Need permission to access microphone',
      message: 'To run this demo we need permission to access your microphone',
      buttonNegative: 'Cancel',
      buttonPositive: 'OK',
    })
  }

  const _requestCameraPermission = () => {
    return PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
      title: 'Need permission to access camera',
      message: 'To run this demo we need permission to access your camera',
      buttonNegative: 'Cancel',
      buttonPositive: 'OK',
    })
  }

  return (
    <View>
      {status === 'disconnected' && (
        <View>
          <Text>React Native Twilio Video</Text>
          <Button title="Connect" onPress={_onConnectButtonPress}></Button>
        </View>
      )}

      {(status === 'connected' || status === 'connecting') && (
        <View>
          {status === 'connected' && (
            <View>
              {Array.from(videoTracks, ([trackSid, trackIdentifier]) => {
                return (
                  <TwilioVideoParticipantView key={trackSid} trackIdentifier={trackIdentifier} />
                )
              })}
            </View>
          )}
          <View>
            <TouchableOpacity onPress={_onEndButtonPress}>
              <Text style={{ fontSize: 12 }}>End</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={_onMuteButtonPress}>
              <Text style={{ fontSize: 12 }}>{isAudioEnabled ? 'Mute' : 'Unmute'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={_onFlipButtonPress}>
              <Text style={{ fontSize: 12 }}>Flip</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={_onShareButtonPressed}>
              <Text style={{ fontSize: 12 }}>{isSharing ? 'Stop Sharing' : 'Start Sharing'}</Text>
            </TouchableOpacity>
            <TwilioVideoLocalView enabled={true} />
          </View>
        </View>
      )}

      <TwilioVideo
        ref={twilioVideo}
        onRoomDidConnect={_onRoomDidConnect}
        onRoomDidDisconnect={_onRoomDidDisconnect}
        onRoomDidFailToConnect={_onRoomDidFailToConnect}
        onParticipantAddedVideoTrack={_onParticipantAddedVideoTrack}
        onParticipantRemovedVideoTrack={_onParticipantRemovedVideoTrack}
        onNetworkQualityLevelsChanged={_onNetworkLevelChanged}
        onDominantSpeakerDidChange={_onDominantSpeakerDidChange}
      />
    </View>
  )
}

AppRegistry.registerComponent('Example', () => Example)
