import React from 'react'
import { Text, TouchableOpacity, Image, Linking } from 'react-native'
import { Styles } from '@/constants/Styles'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

type LawyerInfoProps = {
  onPressBack?: () => void
}
export default function LawyerInfo({ onPressBack = () => {} }: LawyerInfoProps) {
  const phnum = '123-789-1234'

  const handleCall = () => {
    Linking.openURL('tel:${phnum}')
  }
  const goingBack = () => {
    onPressBack()
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={Styles.LawyerInfoContainer}>
        <Image
          source={{ uri: 'LiveLawyerApp/assets/images/react-logo.png' }}
          style={Styles.lawyerlogo}
        />

        <Text style={Styles.LawofficeName}>Doeman's Law Office</Text>

        <Text style={Styles.nameText}>John Doeman sqr</Text>

        <TouchableOpacity onPress={handleCall}>
          <Text style={Styles.phoneText}>{phnum}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={Styles.goBackButton} onPress={goingBack}>
          <Text style={Styles.goBackButtonText}>Go Back To List of Lawyers</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
