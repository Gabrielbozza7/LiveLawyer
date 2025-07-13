import React, { useEffect, useState } from 'react'
import { TouchableOpacity, Linking, FlatList, ScrollView } from 'react-native'
import { newStyles } from '@/constants/Styles'
import { router, useLocalSearchParams } from 'expo-router'
import { LawOfficeDetailsSingle } from 'livelawyerlibrary/api/types/law-office'
import { useAlerter, useApi } from 'livelawyerlibrary/context-manager'
import { StandalonePage } from '@/components/ui/standalone-page'
import { Avatar, Card, Icon, Text } from 'react-native-paper'
import { placeholderLogo } from '../(tabs)/lawyers'

export default function LawOfficeInfo() {
  const { id }: { id: string | undefined } = useLocalSearchParams() as { id: string | undefined }
  const alerterRef = useAlerter()
  const apiRef = useApi()
  const [officeInfo, setLawOfficeInfo] = useState<LawOfficeDetailsSingle | null>(null)

  useEffect(() => {
    if (id === undefined) {
      router.back()
    } else {
      ;(async () => {
        try {
          const result = await apiRef.current.fetchLawOfficeDetails(id)
          setLawOfficeInfo(result.details)
        } catch {
          alerterRef.current.error(
            'Something went wrong when trying to fetch that law office! Try again later.',
          )
          router.back()
        }
      })()
    }
  }, [id])

  return (
    <StandalonePage title="Office Details">
      <ScrollView>
        {officeInfo && (
          <>
            <Avatar.Image
              source={placeholderLogo}
              size={180}
              style={newStyles.centeredProminentAvatar}
            />

            <Text variant="headlineSmall" style={newStyles.spacedHeading}>
              {officeInfo.name}
            </Text>

            {officeInfo.email && (
              <TouchableOpacity onPress={() => Linking.openURL(`mailto:${officeInfo.email}`)}>
                <Card.Title
                  title={<Text variant="titleMedium">Email</Text>}
                  subtitle={<Text variant="bodySmall">{officeInfo.email}</Text>}
                  left={({ size }) => <Icon source="email-outline" size={size} />}
                />
              </TouchableOpacity>
            )}

            {officeInfo.phoneNumber && (
              <TouchableOpacity onPress={() => Linking.openURL(`tel:${officeInfo.phoneNumber}`)}>
                <Card.Title
                  title={<Text variant="titleMedium">Phone Number</Text>}
                  subtitle={<Text variant="bodySmall">{officeInfo.phoneNumber}</Text>}
                  left={({ size }) => <Icon source="phone-dial" size={size} />}
                />
              </TouchableOpacity>
            )}

            {officeInfo.websiteUrl && (
              <TouchableOpacity onPress={() => Linking.openURL(officeInfo.websiteUrl!)}>
                <Card.Title
                  title={<Text variant="titleMedium">Website URL</Text>}
                  subtitle={<Text variant="bodySmall">{officeInfo.websiteUrl}</Text>}
                  left={({ size }) => <Icon source="web" size={size} />}
                />
              </TouchableOpacity>
            )}

            {officeInfo.address && (
              // TODO: Make it so that the system maps app can show the address on a map.
              <TouchableOpacity onPress={() => {}}>
                <Card.Title
                  title={<Text variant="titleMedium">Address</Text>}
                  subtitle={<Text variant="bodySmall">{officeInfo.address}</Text>}
                  left={({ size }) => <Icon source="domain" size={size} />}
                />
              </TouchableOpacity>
            )}

            {officeInfo.lawyers.length > 0 && (
              <>
                <Text variant="headlineSmall" style={newStyles.spacedHeading}>
                  Lawyers
                </Text>
                <FlatList
                  data={officeInfo.lawyers}
                  renderItem={({ item }) => (
                    <Card.Title
                      title={<Text variant="titleMedium">{item.name}</Text>}
                      left={({ size }) => <Avatar.Image size={size} source={placeholderLogo} />}
                    />
                  )}
                  keyExtractor={item => item.id}
                  scrollEnabled={false}
                />
              </>
            )}
          </>
        )}
      </ScrollView>
    </StandalonePage>
  )
}
