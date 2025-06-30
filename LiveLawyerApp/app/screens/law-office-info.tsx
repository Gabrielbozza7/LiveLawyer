import React, { useEffect, useState } from 'react'
import { Text, TouchableOpacity, Button, Linking, Image, View } from 'react-native'
import { Styles } from '@/constants/Styles'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'

type ItemData = {
  id: string
  office: string
  title: string
  number: string
}

const DATA: ItemData[] = [
  { id: 'Lawyer_1', office: 'Goodman Law Office', title: 'Saul Goodman', number: '123-456-7890' },
  { id: 'Lawyer_2', office: 'Spectre Law Office', title: 'Harvey Spectre', number: '123-456-7891' },
  { id: 'Lawyer_3', office: 'Ross Law Office', title: 'Mike Ross', number: '123-456-7892' },
  { id: 'Lawyer_4', office: 'Litt Law Office', title: 'Louis Litt', number: '123-456-7893' },
]

export default function LawOfficeInfo() {
  const { id }: { id: string | undefined } = useLocalSearchParams() as { id: string | undefined }
  const [officeInfo, setLawOfficeInfo] = useState<ItemData | null>(null)

  useEffect(() => {
    if (id === undefined) {
      router.back()
    } else {
      setLawOfficeInfo(DATA.find(x => x.id === id) ?? null)
    }
  }, [id])

  const handleCall = (lawyer: string) => {
    Linking.openURL(`tel:${lawyer}`)
  }

  return (
    <SafeAreaProvider>
      {officeInfo && (
        <SafeAreaView style={Styles.LawyerInfoContainer}>
          <Image
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            source={require('@/assets/images/main-call-image.jpeg')}
            style={Styles.mainLogoButton}
            resizeMode="contain"
          />
          <View style={Styles.lawyerInfoBox}>
            <Text style={Styles.LawofficeName}>{officeInfo.office}</Text>

            <Text style={Styles.nameText}>{officeInfo.title}</Text>

            <TouchableOpacity onPress={() => handleCall(officeInfo.number)}>
              <Text style={Styles.phoneText}>{officeInfo.number}</Text>
            </TouchableOpacity>
          </View>
          <Button title="Back" onPress={router.back} />
        </SafeAreaView>
      )}
    </SafeAreaProvider>
  )
}
