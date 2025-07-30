import { newStyles } from '@/constants/Styles'
import { Linking, FlatList } from 'react-native'
import { useEffect, useState } from 'react'
import { router, useLocalSearchParams, useRouter } from 'expo-router'
import { useApi } from 'livelawyerlibrary/context-manager'
import { ActivityIndicator, Avatar, Card, FAB, IconButton, Text } from 'react-native-paper'
import { TabPage } from '@/components/ui/tab-page'
import { placeholderLogo } from './lawyers'
import { ErrorBanner } from '@/components/ui/error-banner'
import { useIsFocused } from '@react-navigation/native'
import { ContactSingle } from 'livelawyerlibrary/api/types/contacts'
import { formatPhoneNumberUsOrDefault } from 'livelawyerlibrary'

function ContactDisplay({ entry }: { entry: ContactSingle }) {
  const handleCall = () => {
    Linking.openURL(`tel:${entry.phoneNumber}`)
  }

  return (
    <Card
      style={newStyles.spacedCard}
      onPress={() =>
        router.push(`/screens/edit-contact?data=${encodeURIComponent(JSON.stringify(entry))}`)
      }
    >
      <Card.Title
        title={<Text variant="titleMedium">{entry.name}</Text>}
        subtitle={
          <Text variant="bodySmall">{formatPhoneNumberUsOrDefault(entry.phoneNumber)}</Text>
        }
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
  const apiRef = useApi()
  const router = useRouter()
  const [contacts, setContacts] = useState<ContactSingle[] | null | undefined>(undefined)

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
        try {
          const response = await apiRef.current.fetchContacts()
          setContacts(response.contacts)
        } catch (error) {
          console.log((error as Error).message)
          setContacts(null)
          return
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
          keyExtractor={entry => entry.phoneNumber}
        />
      )}
      <FAB
        icon="refresh"
        onPress={() => router.replace('/(tabs)/contacts?refresh=true')}
        mode="elevated"
        variant="surface"
        style={newStyles.bottomLeftFab}
      />
      <FAB
        icon="plus"
        onPress={() => router.push('/screens/edit-contact')}
        mode="elevated"
        variant="surface"
        style={newStyles.bottomRightFab}
      />
    </TabPage>
  )
}
