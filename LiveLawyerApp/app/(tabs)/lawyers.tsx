import { Styles } from '@/constants/Styles'
import React, { useState, useEffect } from 'react'
import { Alert, FlatList, Text, TouchableOpacity, Platform, Linking } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import * as Location from 'expo-location'
import { setCoordinates } from '@/components/locationStore'
import { router } from 'expo-router'

type ItemData = {
  id: string
  office: string
  title: string
  number: string
}

const DATA: ItemData[] = [
  { id: 'Lawyer_1', office: 'Goodman Law Office', title: 'Saul Goodman', number: '123-456-7890' },
  { id: 'Lawyer_2', office: 'Spectre Law Office', title: 'Harvey Spectre', number: '123-456-7891' },
  { id: 'Lawyer_3', office: 'Ross Law Office', title: 'Mike Ross', number: '123-456-7892' },
  { id: 'Lawyer_4', office: 'Litt Law Office', title: 'Louis Litt', number: '123-456-7893' },
]

export default function LawyerView() {
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

    getLocation()
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
        <FlatList
          data={DATA}
          renderItem={({ item }) => (
            <Item
              item={item}
              onPress={() => router.push(`/screens/law-office-info?id=${item.id}`)}
            />
          )}
          keyExtractor={item => item.id}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
