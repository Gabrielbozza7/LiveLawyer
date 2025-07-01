import React, { useEffect, useState } from 'react'
import { Text, TouchableOpacity, Button, Linking, Image, View, Alert, FlatList } from 'react-native'
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

  const handleCall = (lawyer: string) => {
    Linking.openURL(`tel:${lawyer}`)
  }

  return (
    <SafeAreaProvider>
      {officeInfo && (
        <SafeAreaView>
          <Image
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            source={require('@/assets/images/main-call-image.jpeg')}
            style={Styles.mainLogoButton}
            resizeMode="contain"
          />
          <View style={Styles.lawyerInfoBox}>
            <Text style={Styles.LawofficeName}>{officeInfo.name}</Text>

            <FlatList
              data={officeInfo.lawyers}
              renderItem={({ item }) => <Text style={Styles.nameText}>{item.name}</Text>}
              keyExtractor={item => item.id}
            />

            <TouchableOpacity onPress={() => handleCall('+12223334444')}>
              <Text style={Styles.phoneText}>+12223334444</Text>
            </TouchableOpacity>
          </View>
          <Button title="Back" onPress={router.back} />
        </SafeAreaView>
      )}
    </SafeAreaProvider>
  )
}
