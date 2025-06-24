import { Styles } from '@/constants/Styles'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Text, TouchableOpacity, Image, Alert } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import * as Location from 'expo-location'
import { setCoordinates } from '@/components/locationStore'

export default function Index() {
  const router = useRouter()
  const [, setErrorMsg] = useState<string | null>(null)
  const [, setCoords] = useState<{ lat: number; lon: number } | null>(null)

  // Getting coordinates
  useEffect(() => {
    const getLocationPermission = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== 'granted') {
          Alert.alert('Location Denied')
          return
        }
      } catch (err) {
        setErrorMsg('Failed to fetch location')
        console.log(err)
      }
    }
    const getLocation = async () => {
      const { status } = await Location.getForegroundPermissionsAsync()
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({})
        console.log(`lat: ${loc.coords.latitude}, lon: ${loc.coords.longitude}`)
        setCoords({ lat: loc.coords.latitude, lon: loc.coords.longitude })
        setCoordinates({ lat: loc.coords.latitude, lon: loc.coords.longitude })
      } else {
        console.log('Permission not granted')
      }
    }

    getLocationPermission()
    getLocation()
  }, [])

  const attemptCall = async () => {
    router.navigate(`/call`)
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={Styles.container}>
        <Text style={Styles.pageTitle}>{'\n\n\n'}</Text>
        <TouchableOpacity onPress={attemptCall}>
          <Image
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            source={require('@/assets/images/main-call-image.jpeg')}
            style={Styles.mainLogoButton}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={Styles.centeredText}>Press the Logo To Call A Lawyer.</Text>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
