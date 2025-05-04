import { Styles } from '@/constants/Styles'
import React, { useState, useEffect } from 'react'
import { FlatList, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import LawyerInfo from '../lawyer_info/lawyer_info'
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
  const [users, setUsers] = useState<User[]>([])

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

  return (
    <SafeAreaProvider>
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
