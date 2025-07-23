import { FabWithConfirmation } from '@/components/ui/fab-with-confirmation'
import { TabPage } from '@/components/ui/tab-page'
import { newStyles } from '@/constants/Styles'
import { getCurrentPositionAsync, getForegroundPermissionsAsync } from 'expo-location'
import { useAlerter, useSupabaseClient } from 'livelawyerlibrary/context-manager'
import { Coordinates } from 'livelawyerlibrary/socket-event-definitions'
import { useEffect, useState } from 'react'
import { Linking, Platform } from 'react-native'
import { FAB } from 'react-native-paper'

function LocalLawFirmsFab() {
  const alerterRef = useAlerter()
  const [coords, setCoords] = useState<Coordinates | null>(null)

  useEffect(() => {
    const getLocation = async () => {
      const { status } = await getForegroundPermissionsAsync()
      if (status === 'granted') {
        const loc = await getCurrentPositionAsync({})
        setCoords({ lat: loc.coords.latitude, lon: loc.coords.longitude })
      } else {
        console.log('Permission not granted')
      }
    }

    getLocation()
  }, [])

  /*
    Fetches Coordinates

    // In the future use the coordinates to map to nearest lawyer that is part of livelawyer
  
  */
  const showCoordinatesAlert = () => {
    if (coords) {
      openMapWithQuery(`Lawyers near me`)
    } else {
      alerterRef.current.error('Coordinates not available')
    }
  }

  const openMapWithQuery = (query: string) => {
    const encodedQuery = encodeURIComponent(query)
    const url = Platform.select({
      ios: `http://maps.apple.com/?q=${encodedQuery}`,
      android: `geo:0,0?q=${encodedQuery}`,
    })
    if (url) {
      Linking.openURL(url).catch(err => console.error('An error occurred ', err))
    }
  }

  return (
    <FAB
      icon="map-marker"
      label="Local Law Firms"
      uppercase={true}
      onPress={showCoordinatesAlert}
      mode="elevated"
      variant="surface"
      style={[newStyles.fab, newStyles.spacedCard]}
    />
  )
}

export default function Resources() {
  const alerterRef = useAlerter()
  const supabaseRef = useSupabaseClient()

  const handleOpenTrafficLaws = () => {
    Linking.openURL('https://www.findlaw.com/traffic/traffic-tickets/state-traffic-laws.html')
  }

  // Logout
  const logOut = async () => {
    const { error } = await supabaseRef.current.auth.signOut()
    if (error) {
      alerterRef.current.error(`Failed to log out: ${error.message}`)
    }
  }

  return (
    <TabPage verticallyCenter>
      <LocalLawFirmsFab />
      <FAB
        icon="gavel"
        label="Traffic Laws for All States"
        uppercase={true}
        onPress={handleOpenTrafficLaws}
        mode="elevated"
        variant="surface"
        style={[newStyles.fab, newStyles.spacedCard]}
      />
      <FabWithConfirmation
        icon="logout"
        prompt="Logout?"
        onConfirm={logOut}
        animateFrom="right"
        style={newStyles.bottomRightFab}
      />
    </TabPage>
  )
}
