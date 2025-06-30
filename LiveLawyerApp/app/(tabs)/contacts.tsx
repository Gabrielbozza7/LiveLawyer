import { Colors } from '@/constants/Colors'
import { Styles } from '@/constants/Styles'
import { Text, View, Button, Linking, TouchableOpacity, FlatList } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import { useSessionData, useSupabaseClient } from '../components/context-manager'
import { Database } from 'livelawyerlibrary/database-types'
import { useEffect, useState } from 'react'
import { router } from 'expo-router'

interface ContactDisplayProps {
  id: string
  name: string
  phone: string
}

function ContactDisplay({ id, name, phone }: ContactDisplayProps) {
  const handleCall = (DATA: string) => {
    Linking.openURL(`tel:${DATA}`)
  }

  return (
    <View style={Styles.itemInfoBox}>
      <Text style={Styles.name}>{name}</Text>
      <TouchableOpacity onPress={() => handleCall(phone)}>
        <Text style={Styles.phone}>{phone}</Text>
      </TouchableOpacity>
      <Button
        onPress={() => router.push(`/screens/edit-contact?id=${id}`)}
        title="Edit Contact"
        color={Colors.white}
        accessibilityLabel="Edit the contact."
      />
    </View>
  )
}

export default function Contacts() {
  const supabase = useSupabaseClient()
  const { userId } = useSessionData()
  const [contacts, setContacts] = useState<Database['public']['Tables']['Contact']['Row'][]>([])
  const [placeholder, setPlaceholder] = useState<string | null>('Loading...')

  useEffect(() => {
    refreshContacts()
  }, [])

  const refreshContacts = async () => {
    const { data, error } = await supabase.from('Contact').select().eq('userId', userId)
    if (data) {
      setContacts(data)
    }
    if (error) {
      console.log((error as Error).message)
      setPlaceholder(`Something went wrong when trying to fetch your contacts! Try again later.`)
    } else {
      setPlaceholder(null)
    }
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={Styles.container}>
        {placeholder === null ? (
          <>
            <Button
              onPress={() => router.push('/screens/edit-contact')}
              title="Add New Contact"
              color={Colors.blue}
              accessibilityLabel="Refresh the contacts."
            />
            <FlatList
              data={contacts}
              renderItem={entry => (
                <ContactDisplay
                  id={entry.item.id}
                  name={entry.item.name}
                  phone={entry.item.phoneNumber}
                />
              )}
              keyExtractor={entry => entry.id}
              ListFooterComponent={
                <Button
                  onPress={refreshContacts}
                  title="Refresh"
                  color={Colors.blue}
                  accessibilityLabel="Refresh the contacts."
                />
              }
            />
          </>
        ) : (
          <Text style={Styles.localText}>{placeholder}</Text>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
