import { newStyles } from '@/constants/Styles'
import { Linking, FlatList } from 'react-native'
import { Database } from 'livelawyerlibrary/database-types'
import { useEffect, useState } from 'react'
import { router, useLocalSearchParams, useRouter } from 'expo-router'
import { useSession, useSupabaseClient } from 'livelawyerlibrary/context-manager'
import { ActivityIndicator, Avatar, Card, FAB, IconButton, Text } from 'react-native-paper'
import { TabPage } from '@/components/ui/tab-page'
import { placeholderLogo } from './lawyers'
import { ErrorBanner } from '@/components/ui/error-banner'
import { useIsFocused } from '@react-navigation/native'

function ContactDisplay({ entry }: { entry: Database['public']['Tables']['Contact']['Row'] }) {
  const handleCall = () => {
    Linking.openURL(`tel:${entry.phoneNumber}`)
  }

  return (
    <Card
      style={newStyles.spacedCard}
      onPress={() => router.push(`/screens/edit-contact?id=${entry.id}`)}
    >
      <Card.Title
        title={<Text variant="titleMedium">{entry.name}</Text>}
        subtitle={<Text variant="bodySmall">{entry.phoneNumber}</Text>}
        left={({ size }) => <Avatar.Image size={size} source={placeholderLogo} />}
        right={({ size }) => (
          <IconButton
            onPress={handleCall}
            icon={'phone-in-talk'}
            size={size}
            containerColor="transparent"
          />
        )}
      />
    </Card>
  )
}

export default function Contacts() {
  const supabaseRef = useSupabaseClient()
  const sessionRef = useSession()
  const router = useRouter()
  const [contacts, setContacts] = useState<
    Database['public']['Tables']['Contact']['Row'][] | null | undefined
  >(undefined)

  // Allowing refreshing when contacts change:
  const focused = useIsFocused()
  const { refresh }: { refresh: string | undefined } = useLocalSearchParams() as {
    refresh: string | undefined
  }
  useEffect(() => {
    if (focused && refresh === 'true') {
      setContacts(undefined)
      router.replace('/(tabs)/contacts')
    }
  }, [focused, refresh])

  // Refreshing contacts:
  useEffect(() => {
    if (contacts === undefined) {
      ;(async () => {
        const { data, error } = await supabaseRef.current
          .from('Contact')
          .select()
          .eq('userId', sessionRef.current.user.id)
        if (data) {
          setContacts(data)
        }
        if (error) {
          console.log((error as Error).message)
          setContacts(null)
        }
      })()
    }
  }, [contacts])

  return (
    <TabPage>
      {contacts === undefined ? (
        <ActivityIndicator />
      ) : contacts === null ? (
        <ErrorBanner text="Something went wrong when trying to fetch your contacts! Try again later." />
      ) : (
        <FlatList
          data={contacts}
          renderItem={entry => <ContactDisplay entry={entry.item} />}
          keyExtractor={entry => entry.id}
        />
      )}
      <FAB
        icon="refresh"
        onPress={() => router.replace('/(tabs)/contacts?refresh=true')}
        style={newStyles.bottomLeftFab}
      />
      <FAB
        icon="plus"
        onPress={() => router.push('/screens/edit-contact')}
        style={newStyles.bottomRightFab}
      />
    </TabPage>
  )
}
