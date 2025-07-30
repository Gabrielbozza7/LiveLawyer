import { newStyles } from '@/constants/Styles'
import React, { useState, useEffect } from 'react'
import { FlatList } from 'react-native'
import { router } from 'expo-router'
import { useSupabaseClient } from 'livelawyerlibrary/context-manager'
import { TabPage } from '@/components/ui/tab-page'
import { ActivityIndicator, Avatar, Card, FAB, Text } from 'react-native-paper'
import { ErrorBanner } from '@/components/ui/error-banner'

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
  const [offices, setOffices] = useState<LawOfficeListingProps[] | null | undefined>(undefined)

  // Refreshing offices:
  useEffect(() => {
    if (offices === undefined) {
      ;(async () => {
        const { data, error } = await supabaseRef.current.from('LawOffice').select('id, name')
        if (data) {
          setOffices(data)
        } else {
          console.log(error.message)
          setOffices(null)
        }
      })()
    }
  }, [offices])

  return (
    <TabPage>
      {offices === undefined ? (
        <ActivityIndicator />
      ) : offices === null ? (
        <ErrorBanner text="Something went wrong when trying to fetch the law offices! Try again later." />
      ) : (
        <FlatList
          data={offices}
          renderItem={({ item }) => <LawOfficeListing id={item.id} name={item.name} />}
          keyExtractor={item => item.id}
        />
      )}
      <FAB
        icon="refresh"
        onPress={() => setOffices(undefined)}
        mode="elevated"
        variant="surface"
        style={newStyles.bottomLeftFab}
      />
    </TabPage>
  )
}
