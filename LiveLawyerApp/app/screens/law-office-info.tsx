import React, { useEffect, useState } from 'react'
import {
  Text,
  TouchableOpacity,
  Button,
  Linking,
  Image,
  View,
  Alert,
  FlatList,
  ScrollView,
} from 'react-native'
import { Styles } from '@/constants/Styles'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { LawOfficeDetailsSingle } from 'livelawyerlibrary/api/types/law-office'
import { useApi } from 'livelawyerlibrary/context-manager'

export default function LawOfficeInfo() {
  const { id }: { id: string | undefined } = useLocalSearchParams() as { id: string | undefined }
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
          Alert.alert('Something went wrong when trying to fetch that law office! Try again later.')
          router.back()
        }
      })()
    }
  }, [id])

  return (
    <SafeAreaProvider>
      {officeInfo && (
        <SafeAreaView>
          <ScrollView>
            <Image
              // eslint-disable-next-line @typescript-eslint/no-require-imports
              source={require('@/assets/images/main-call-image.jpeg')}
              style={Styles.mainLogoButton}
              resizeMode="contain"
            />
            <View style={Styles.lawyerInfoBox}>
              <Text style={Styles.LawofficeName}>{officeInfo.name}</Text>

              {officeInfo.email && (
                <TouchableOpacity onPress={() => Linking.openURL(`mailto:${officeInfo.email}`)}>
                  <Text style={Styles.phoneText}>{officeInfo.email}</Text>
                </TouchableOpacity>
              )}

              {officeInfo.phoneNumber && (
                <TouchableOpacity onPress={() => Linking.openURL(`tel:${officeInfo.phoneNumber}`)}>
                  <Text style={Styles.phoneText}>{officeInfo.phoneNumber}</Text>
                </TouchableOpacity>
              )}

              {officeInfo.websiteUrl && (
                <TouchableOpacity onPress={() => Linking.openURL(officeInfo.websiteUrl!)}>
                  <Text style={Styles.phoneText}>{officeInfo.websiteUrl}</Text>
                </TouchableOpacity>
              )}

              {officeInfo.address && <Text style={Styles.nameText}>{officeInfo.address}</Text>}

              <Text style={Styles.LawofficeName} />
              <Text style={Styles.LawofficeName}>Lawyers</Text>
              <FlatList
                data={officeInfo.lawyers}
                renderItem={({ item }) => <Text style={Styles.nameText}>{item.name}</Text>}
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />
            </View>
            <Button title="Back" onPress={router.back} />
          </ScrollView>
        </SafeAreaView>
      )}
    </SafeAreaProvider>
  )
}
