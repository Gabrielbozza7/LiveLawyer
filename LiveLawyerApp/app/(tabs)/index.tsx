import { newStyles } from '@/constants/Styles'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { StyleSheet, Image, View, TouchableOpacity } from 'react-native'
import * as Location from 'expo-location'
import { setCoordinates } from '@/components/locationStore'
import { useAlerter } from 'livelawyerlibrary/context-manager'
import { Coordinates } from 'livelawyerlibrary/socket-event-definitions'
import { Text } from 'react-native-paper'
import { TabPage } from '@/components/ui/tab-page'
import { Colors } from '@/constants/Colors'
import { placeholderLogo } from './lawyers'

export default function Index() {
  const alerterRef = useAlerter()
  const router = useRouter()
  const [, setCoords] = useState<Coordinates | null>(null)

  // Getting coordinates
  const getLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        alerterRef.current.error('Location Denied')
        return
      } else {
        const loc = await Location.getCurrentPositionAsync({})
        console.log(`lat: ${loc.coords.latitude}, lon: ${loc.coords.longitude}`)
        setCoords({ lat: loc.coords.latitude, lon: loc.coords.longitude })
        setCoordinates({ lat: loc.coords.latitude, lon: loc.coords.longitude })
      }
    } catch (err) {
      alerterRef.current.error('Failed to fetch location!')
      console.log(err)
    }
  }

  useEffect(() => {
    getLocationPermission()
  }, [])

  const attemptCall = async () => {
    router.navigate(`/screens/call`)
  }

  return (
    <TabPage verticallyCenter={true} horizontallyCenter={true}>
      <View style={styles.callButtonContainer}>
        <TouchableOpacity onPress={attemptCall} style={styles.callButton}>
          <Image style={styles.callButtonLogo} source={placeholderLogo} resizeMode="cover" />
        </TouchableOpacity>
      </View>
      <Text variant="headlineSmall" style={newStyles.centeredText}>
        {'\n'}Press the logo to make a call!
      </Text>
    </TabPage>
  )
}

const styles = StyleSheet.create({
  callButtonContainer: {
    // iOS shadow:
    shadowColor: Colors.gray,
    shadowOffset: { height: 1, width: 0 },
    shadowOpacity: 0.75,
    shadowRadius: 4,
  },
  callButton: {
    width: '80%',
    aspectRatio: 1,
    borderRadius: 50,
    overflow: 'hidden',
    // Android shadow:
    elevation: 5,
  },
  callButtonLogo: {
    height: '100%',
    aspectRatio: 1,
  },
})
