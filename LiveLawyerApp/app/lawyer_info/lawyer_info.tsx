import React from 'react'
import { Text, TouchableOpacity, Button, Linking, Image, View } from 'react-native'
import { Styles } from '@/constants/Styles'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

//const reactLogo = require('@/assets/images/react-logo.png');

type LawyerInfoProps = {
  onPressBack: () => void
  lawyer: {
    id: string
    office: string
    title: string
    number: string
  }
}
export default function LawyerInfo({ onPressBack, lawyer }: LawyerInfoProps) {
  //const phnum = '123-789-1234'
  // const handleCall = () => {
  //   Linking.openURL('tel:${phnum}')
  // }
  const handleCall = (lawyer: string) => {
    Linking.openURL(`tel:${lawyer}`)
  }
  const goBack = () => {
    onPressBack()
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={Styles.LawyerInfoContainer}>
        <Image
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          source={require('@/assets/images/main-call-image.jpeg')}
          style={Styles.mainLogoButton}
          resizeMode="contain"
        />
        <View style={Styles.lawyerInfoBox}>
          <Text style={Styles.LawofficeName}>{lawyer.office}</Text>

          <Text style={Styles.nameText}>{lawyer.title}</Text>

          <TouchableOpacity onPress={() => handleCall(lawyer.number)}>
            <Text style={Styles.phoneText}>{lawyer.number}</Text>
          </TouchableOpacity>
        </View>
        <Button title="Back To List of Lawyers" onPress={goBack} />
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
