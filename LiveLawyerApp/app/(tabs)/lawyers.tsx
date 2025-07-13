import { newStyles, Styles } from '@/constants/Styles'
import React, { useState, useEffect } from 'react'
import { FlatList } from 'react-native'
import { router } from 'expo-router'
import { useSupabaseClient } from 'livelawyerlibrary/context-manager'
import { TabPage } from '@/components/ui/tab-page'
import { Avatar, Card, Text } from 'react-native-paper'

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
  const [offices, setOffices] = useState<LawOfficeListingProps[]>([])
  const [placeholder, setPlaceholder] = useState<string | null>('Loading...')

  const refreshLawOffices = async () => {
    const { data, error } = await supabaseRef.current.from('LawOffice').select('id, name')
    if (data) {
      setOffices(data)
    }
    if (error) {
      console.log((error as Error).message)
      setPlaceholder(`Something went wrong when trying to fetch the law offices! Try again later.`)
    } else {
      setPlaceholder(null)
    }
  }

  useEffect(() => {
    refreshLawOffices()
  }, [])

  return (
    <TabPage>
      {placeholder === null ? (
        <FlatList
          data={offices}
          renderItem={({ item }) => <LawOfficeListing id={item.id} name={item.name} />}
          keyExtractor={item => item.id}
        />
      ) : (
        <Text style={Styles.localText}>{placeholder}</Text>
      )}
    </TabPage>
  )
}
