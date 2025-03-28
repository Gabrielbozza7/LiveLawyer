import React, { useState } from 'react'
import { View, Text, SafeAreaView, StyleSheet, Dimensions, TouchableOpacity } from 'react-native'

const { width, height } = Dimensions.get('window') // Get screen dimensions

export default function VideoCallScreen() {
  // Simulated remote participant
  const remoteParticipant = { id: '1', name: 'REMOTE USER' }

  return (
    <SafeAreaView style={styles.container}>
      {/* Remote Participant Video (Fills Screen) */}
      <View style={styles.remoteVideo}>
        <Text style={styles.videoText}>{remoteParticipant.name}</Text>
      </View>

      {/* Bottom Section: Buttons on Left & Local Video on Right */}
      <View style={styles.bottomContainer}>
        {/* Buttons on the Left */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.Button}
            onPress={() => {
              /** FLIP CAMERA */
            }}
          >
            <Text>FLIP CAMERA</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.Button}
            onPress={() => {
              /** LEAVE CALL */
            }}
          >
            <Text>LEAVE CALL</Text>
          </TouchableOpacity>
        </View>

        {/* Local Video on the Right */}
        <View style={styles.localVideo}>
          <Text style={styles.videoText}>LOCAL USER</Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  bottomContainer: {
    flexDirection: 'row', // Aligns buttons & video in a row
    position: 'absolute',
    bottom: 50, // Adjusts position from bottom
    left: 15,
    right: 15,
    width: width - 30, // Makes it stretch horizontally
    alignItems: 'center',
    justifyContent: 'space-between', // Keeps buttons on left, video on right
  },
  buttonContainer: {
    flexDirection: 'column', // Stacks buttons vertically
    alignItems: 'flex-start', // Aligns buttons to the left
    gap: 100, // Adds space between buttons
  },
  Button: {
    backgroundColor: 'red',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  localVideo: {
    backgroundColor: 'blue',
    width: width * 0.35,
    height: height * 0.25,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  remoteVideo: {
    backgroundColor: 'gray',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
