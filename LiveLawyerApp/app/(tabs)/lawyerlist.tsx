import { Styles } from '@/constants/Styles'
import React, { useState, useEffect } from 'react'
import { Alert, FlatList, Text, TouchableOpacity, Platform, Linking } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import LawyerInfo from '../lawyer_info/lawyer_info'
import * as Location from 'expo-location'
import { setCoordinates } from '@/components/locationStore'
import { BACKEND_URL } from '@/constants/BackendVariables'

type ItemData = {
  id: string
  office: string
  title: string
  number: string
}
//Data place holder
var Data: ItemData[] = [
  { id: 'Lawyer_1', office: 'Goodman Law Office', title: 'Saul Goodman', number: '123-456-7890' },
  { id: 'Lawyer_2', office: 'Spectre Law Office', title: 'Harvey Spectre', number: '123-456-7891' },
  { id: 'Lawyer_3', office: 'Ross Law Office', title: 'Mike Ross', number: '123-456-7892' },
  { id: 'Lawyer_4', office: 'Litt Law Office', title: 'Louis Litt', number: '123-456-7893' },
]

type User = {
  id: string
  first_name: string
  last_name: string
}

export default function LawyerView() {
  const [lawyer, setLawyer] = useState<ItemData | null>(null)
  const [, setUsers] = useState<User[]>([])
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null)

  useEffect(() => {
    async function getDB() {
      try {
        const response = await fetch(`${BACKEND_URL}/users`)
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        console.log('Fetched Users:', data)

        setUsers(data.users)
      } catch (error) {
        console.error('Error fetching users:', error)
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

    getLocation()
    getDB()
  }, [])

  type ItemProps = {
    item: ItemData
    onPress: () => void
  }

  const Item = ({ item, onPress }: ItemProps) => (
    <TouchableOpacity onPress={onPress} style={Styles.itemInfoBox}>
      <Text style={Styles.name}>{item.title}</Text>
    </TouchableOpacity>
  )

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
      Alert.alert(`Latitude: ${coords.lat}\nLongitude: ${coords.lon}`)
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
      {lawyer ? (
        <LawyerInfo onPressBack={() => setLawyer(null)} lawyer={lawyer}></LawyerInfo>
      ) : (
        <SafeAreaView style={Styles.container}>
          <FlatList
            data={Data}
            renderItem={({ item }) => <Item item={item} onPress={() => setLawyer(item)} />}
            keyExtractor={item => item.id}
          />
        </SafeAreaView>
      )}
    </SafeAreaProvider>
  )
}
