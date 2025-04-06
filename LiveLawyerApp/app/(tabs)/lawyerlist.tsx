import { Styles } from '@/constants/Styles'
import React, { useState, useEffect } from 'react'
import { FlatList, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import LawyerInfo from '../lawyer_info/lawyer_info'

type ItemData = {
  id: string
  title: string
}

const Data: ItemData[] = [
  { id: 'Lawyer_1', title: 'Saul Goodman' },
  { id: 'Lawyer_2', title: 'Harvey Spectre' },
  { id: 'Lawyer_3', title: 'Mike Ross' },
  { id: 'Lawyer_4', title: 'Louis Litt' },
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
        const response = await fetch('http://192.168.87.31:4000/users', {
          method: 'GET',
        })
        
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

  return (
    <SafeAreaProvider>
      {lawyer ? (
        <LawyerInfo onPressBack={() => setLawyer(null)} />
      ) : (
        <SafeAreaView style={Styles.container}>
          {/* Lawyer List */}
          <FlatList
            data={Data}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => setLawyer(item)} style={Styles.itemLawyer}>
                <Text style={Styles.title}>{item.title}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
          />

          {/* Divider */}
          <View style={{ marginVertical: 20, height: 2, backgroundColor: '#ddd' }} />

          {/* Fetched Users */}
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            Users from Database:
          </Text>
          {users.length > 0 ? (
            users.map((user) => (
              <Text key={user.id} style={{ fontSize: 16 }}>
                {user.first_name} {user.last_name}
              </Text>
            ))
          ) : (
            <Text style={{ fontSize: 16, color: 'gray' }}>Loading users...</Text>
          )}
        </SafeAreaView>
      )}
    </SafeAreaProvider>
  )
}
