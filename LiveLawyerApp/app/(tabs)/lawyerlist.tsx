import { Styles } from '@/constants/Styles'
import React, { useState, useEffect } from 'react'
import { FlatList, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import LawyerInfo from '../lawyer_info/lawyer_info'

type ItemData = {
  id: string
  office: string
  title: string
  number: string
}
//Data place holder
var Data: ItemData[] = [
  {
    id: 'Lawyer_1',
    office: 'Goodman Law Office',
    title: 'Saul Goodman',
    number: '123-456-7890',
  },
  {
    id: 'Lawyer_2',
    office: 'Spectre Law Office',
    title: 'Harvey Spectre',
    number: '123-456-7891',
  },
  {
    id: 'Lawyer_3',
    office: 'Ross Law Office',
    title: 'Mike Ross',
    number: '123-456-7892',
  },
  {
    id: 'Lawyer_4',
    office: 'Litt Law Office',
    title: 'Louis Litt',
    number: '123-456-7893',
  },
]

type User = {
  id: string
  first_name: string
  last_name: string
}

const [BACKEND_IP, BACKEND_PORT] = getBackendVariables()

export function getBackendVariables(): [ip: string, port: string] {
  let ip = process.env.EXPO_PUBLIC_BACKEND_IP
  let port = process.env.EXPO_PUBLIC_BACKEND_PORT
  if (ip === undefined) {
    console.log(
      "WARNING: EXPO_PUBLIC_BACKEND_IP environment variable not set, defaulting to 'localhost'!",
    )
    ip = 'localhost'
  }
  if (port === undefined) {
    console.log(
      "WARNING: EXPO_PUBLIC_BACKEND_PORT environment variable not set, defaulting to '4000'!",
    )
    port = '4000'
  }
  return [ip, port]
}

export default function LawyerView() {
  const [lawyer, setLawyer] = useState<ItemData | null>(null)
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    async function getDB() {
      try {
        const response = await fetch(`http://${BACKEND_IP}:${BACKEND_PORT}/users`, {
          method: 'GET'
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
        <LawyerInfo onPressBack={() => setLawyer(null)} lawyer={
        lawyer}></LawyerInfo>
      ) : (
        <SafeAreaView style={Styles.container}>
          {/* Lawyer List */}
          <FlatList
            data={Data}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => setLawyer(item)} style={Styles.itemLawyer}>
                <Text style={Styles.title}>{item.title}</Text>
                <Text>{item.office}</Text>
                <Text>{item.number}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={item => item.id}
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
