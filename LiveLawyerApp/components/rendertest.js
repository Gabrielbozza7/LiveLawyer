import React, { useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window'); // Get screen dimensions

export default function VideoCallScreen() {
  // Simulated remote participant
  const remoteParticipant = { id: '1', name: 'REMOTE USER' };

  return (
    <SafeAreaView style={styles.container}>
      {/* Remote Participant Video (Fills Screen) */}
      <View style={styles.videoRemote}>
        <Text style={styles.videoText}>{remoteParticipant.name}</Text>
      </View>

      {/* Local User Video (Small floating at bottom-right) */}
      <View style={styles.videoLocal}>
        <Text style={styles.videoText}>LOCAL USER</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  videoRemote: {
    flex: 1, // Fills entire screen
    backgroundColor: 'gray',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoLocal: {
    position: 'absolute',
    width: width * 0.35, // 25% of the screen width
    height: height * 0.25, // 25% of the screen height
    bottom: 45, // Positioned at bottom-right
    right: 15,
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  videoText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
