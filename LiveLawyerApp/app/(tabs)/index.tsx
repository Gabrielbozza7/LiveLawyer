import { newStyles } from '@/constants/Styles'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Dimensions, StyleSheet, TouchableOpacity } from 'react-native'
import * as Location from 'expo-location'
import { setCoordinates } from '@/components/locationStore'
import { useAlerter } from 'livelawyerlibrary/context-manager'
import { Coordinates } from 'livelawyerlibrary/socket-event-definitions'
import { Icon, Text } from 'react-native-paper'
import { Page } from '@/components/ui/page'
import { Colors } from '@/constants/Colors'

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
    router.navigate(`/call`)
  }

  return (
    <Page verticallyCenter={true} horizontallyCenter={true}>
      <TouchableOpacity onPress={attemptCall} style={styles.callButton}>
        <Icon source="phone" color="white" size={150} />
        <Text
          variant="displayLarge"
          theme={{ colors: { onSurface: 'white' } }}
          style={newStyles.centeredText}
        >
          CALL
        </Text>
      </TouchableOpacity>
      <Text variant="headlineSmall" style={newStyles.centeredText}>
        Press the button to make a call!
      </Text>
    </Page>
  )
}

const { width: WIDTH } = Dimensions.get('window')

const styles = StyleSheet.create({
  callButton: {
    backgroundColor: Colors.red,
    width: WIDTH * 0.8,
    height: WIDTH * 0.8,
    borderRadius: WIDTH * 0.4,
    marginVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
