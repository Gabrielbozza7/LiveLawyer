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
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */
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

import styleSheet from './styles'

const styles = StyleSheet.create(styleSheet)

const ExampleRaw = props => {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isScreenShareEnabled, setIsScreenShareEnabled] = useState(false)
  const [status, setStatus] = useState('disconnected')
  const [participants, setParticipants] = useState(new Map())
  const [videoTracks, setVideoTracks] = useState(new Map())
  const [token, setToken] = useState(props.token)
  const twilioVideo = useRef(null)

  const _onConnectButtonPress = async () => {
    if (Platform.OS === 'android') {
      await _requestAudioPermission()
      await _requestCameraPermission()
    }
    try {
      twilioVideo.current.connect({
        roomName: 'abcxyz123',
        accessToken: token,
        enableNetworkQualityReporting: true,
        dominantSpeakerEnabled: true,
      })
    } catch (e) {
      console.log(`Error:\n${e.stack}`)
    }
    setStatus('connecting')
  }

  const _onEndButtonPress = () => {
    twilioVideo.current.disconnect()
  }

  const _onMuteButtonPress = () => {
    twilioVideo.current
      .setLocalAudioEnabled(!isAudioEnabled)
      .then(isEnabled => setIsAudioEnabled(isEnabled))
  }

  const _onShareButtonPressed = () => {
    twilioVideo.current.toggleScreenSharing(!isSharing)
    setIsSharing(!isSharing)
  }

  const _onFlipButtonPress = () => {
    twilioVideo.current.flipCamera()
  }

  const _onRoomDidConnect = () => {
    setStatus('connected')
  }

  const _onRoomDidDisconnect = ({ error }) => {
    console.log('ERROR: ', error)

    setStatus('disconnected')
  }

  const _onRoomDidFailToConnect = error => {
    console.log('ERROR: ', error)

    setStatus('disconnected')
  }

  const _onParticipantAddedVideoTrack = ({ participant, track }) => {
    console.log('onParticipantAddedVideoTrack: ', participant, track)

    setVideoTracks(originalVideoTracks => {
      originalVideoTracks.set(track.trackSid, {
        participantSid: participant.sid,
        videoTrackSid: track.trackSid,
      })
      return new Map(originalVideoTracks)
    })
  }

  const _onParticipantRemovedVideoTrack = ({ participant, track }) => {
    console.log('onParticipantRemovedVideoTrack: ', participant, track)

    setVideoTracks(originalVideoTracks => {
      originalVideoTracks.delete(track.trackSid)
      return new Map(originalVideoTracks)
    })
  }

  const _onNetworkLevelChanged = ({ participant, isLocalUser, quality }) => {
    console.log('Participant', participant, 'isLocalUser', isLocalUser, 'quality', quality)
  }

  const _onDominantSpeakerDidChange = ({ roomName, roomSid, participant }) => {
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
    <View style={styles.container}>
      {status === 'disconnected' && (
        <View>
          <Text style={styles.welcome}>React Native Twilio Video</Text>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            value={token}
            onChangeText={text => setToken(text)}
          ></TextInput>
          <Button title="Connect" style={styles.button} onPress={_onConnectButtonPress}></Button>
        </View>
      )}

      {(status === 'connected' || status === 'connecting') && (
        <View style={styles.callContainer}>
          {status === 'connected' && (
            <View style={styles.remoteGrid}>
              {Array.from(videoTracks, ([trackSid, trackIdentifier]) => {
                return (
                  <TwilioVideoParticipantView
                    style={styles.remoteVideo}
                    key={trackSid}
                    trackIdentifier={trackIdentifier}
                  />
                )
              })}
            </View>
          )}
          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.optionButton} onPress={_onEndButtonPress}>
              <Text style={{ fontSize: 12 }}>End</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton} onPress={_onMuteButtonPress}>
              <Text style={{ fontSize: 12 }}>{isAudioEnabled ? 'Mute' : 'Unmute'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton} onPress={_onFlipButtonPress}>
              <Text style={{ fontSize: 12 }}>Flip</Text>
            </TouchableOpacity>
            <TwilioVideoLocalView enabled={true} style={styles.localVideo} />
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

AppRegistry.registerComponent('Example', () => ExampleRaw)

export default ExampleRaw
