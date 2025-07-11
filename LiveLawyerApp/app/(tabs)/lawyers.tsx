import { newStyles, Styles } from '@/constants/Styles'
import React, { useState, useEffect } from 'react'
import { Alert, FlatList, Platform, Linking } from 'react-native'
import * as Location from 'expo-location'
import { setCoordinates } from '@/components/locationStore'
import { router } from 'expo-router'
import { useSupabaseClient } from 'livelawyerlibrary/context-manager'
import { TabPage } from '@/components/ui/tab-page'
import { Avatar, Card, FAB, Text } from 'react-native-paper'

// eslint-disable-next-line @typescript-eslint/no-require-imports
export const placeholderLogo = require('../../assets/images/main-call-image.jpeg')

interface LawOfficeListingProps {
  id: string
  name: string
}

function LawOfficeListing({ id, name }: LawOfficeListingProps) {
  return (
    <Card
      style={newStyles.spacedCard}
      onPress={() => router.push(`/screens/law-office-info?id=${id}`)}
    >
      <Card.Title
        title={<Text variant="titleMedium">{name}</Text>}
        subtitle={<Text variant="bodySmall">Some other information maybe</Text>}
        left={({ size }) => <Avatar.Image size={size} source={placeholderLogo} />}
      />
    </Card>
  )
}

export default function LawyerView() {
  const supabaseRef = useSupabaseClient()
  const [offices, setOffices] = useState<LawOfficeListingProps[]>([])
  const [placeholder, setPlaceholder] = useState<string | null>('Loading...')
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null)

  // For that button at the top
  useEffect(() => {
    const getLocation = async () => {
      const { status } = await Location.getForegroundPermissionsAsync()
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({})
        setCoords({ lat: loc.coords.latitude, lon: loc.coords.longitude })
        setCoordinates({ lat: loc.coords.latitude, lon: loc.coords.longitude })
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
      Alert.alert('Coordinates not available')
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

  const refreshLawOffices = async () => {
    const { data, error } = await supabaseRef.current.from('LawOffice').select('id, name')
    if (data) {
      setOffices(data)
    }
    if (error) {
      console.log((error as Error).message)
      setPlaceholder(`Something went wrong when trying to fetch the law offices! Try again later.`)
    } else {
      setPlaceholder(null)
    }
  }

  useEffect(() => {
    refreshLawOffices()
  }, [])

  return (
    <TabPage>
      <FAB
        icon="map-marker"
        label="Local Law Firms"
        uppercase={true}
        onPress={showCoordinatesAlert}
        style={newStyles.fab}
      />
      {placeholder === null ? (
        <FlatList
          data={offices}
          renderItem={({ item }) => <LawOfficeListing id={item.id} name={item.name} />}
          keyExtractor={item => item.id}
        />
      ) : (
        <Text style={Styles.localText}>{placeholder}</Text>
      )}
    </TabPage>
  )
}
