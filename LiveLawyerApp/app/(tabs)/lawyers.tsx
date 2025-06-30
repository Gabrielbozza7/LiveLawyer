import { Styles } from '@/constants/Styles'
import React, { useState, useEffect } from 'react'
import { Alert, FlatList, Text, TouchableOpacity, Platform, Linking } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import * as Location from 'expo-location'
import { setCoordinates } from '@/components/locationStore'
import { router } from 'expo-router'
import { useSupabaseClient } from '../components/context-manager'

interface LawOfficeListingProps {
  id: string
  name: string
}

function LawOfficeListing({ id, name }: LawOfficeListingProps) {
  return (
    <TouchableOpacity
      onPress={() => router.push(`/screens/law-office-info?id=${id}`)}
      style={Styles.itemInfoBox}
    >
      <Text style={Styles.name}>{name}</Text>
    </TouchableOpacity>
  )
}

export default function LawyerView() {
  const supabase = useSupabaseClient()
  const [offices, setOffices] = useState<LawOfficeListingProps[]>([])
  const [placeholder, setPlaceholder] = useState<string | null>('Loading...')
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null)

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
    const refreshLawOffices = async () => {
      const { data, error } = await supabase.from('LawOffice').select('id, name')
      if (data) {
        setOffices(data)
      }
      if (error) {
        console.log((error as Error).message)
        setPlaceholder(
          `Something went wrong when trying to fetch the law offices! Try again later.`,
        )
      } else {
        setPlaceholder(null)
      }
    }

    getLocation()
    refreshLawOffices()
  }, [])

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

  return (
    <SafeAreaProvider>
      <TouchableOpacity onPress={showCoordinatesAlert} style={Styles.localLawyerButton}>
        <Text style={Styles.localText}>Local Lawfirms</Text>
      </TouchableOpacity>
      <SafeAreaView style={Styles.container}>
        {placeholder === null ? (
          <FlatList
            data={offices}
            renderItem={({ item }) => <LawOfficeListing id={item.id} name={item.name} />}
            keyExtractor={item => item.id}
          />
        ) : (
          <Text style={Styles.localText}>{placeholder}</Text>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
