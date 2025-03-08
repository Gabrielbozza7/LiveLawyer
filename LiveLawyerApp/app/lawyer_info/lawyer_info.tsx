import React from 'react'
import { Text, TouchableOpacity, Image } from 'react-native'
import { Styles } from '@/constants/Styles'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

const reactLogo = require('../../assets/images/react-logo.png');

type LawyerInfoProps = {
  onPressBack: () => void
}
export default function LawyerInfo({ onPressBack }: LawyerInfoProps) {
  const phnum = '123-789-1234'
  // const handleCall = () => {
  //   Linking.openURL('tel:${phnum}')
  // }
  const handleCall = () => {
    onPressBack()
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={Styles.LawyerInfoContainer}>
        <Image
          source={reactLogo}
          style={Styles.lawyerlogo}
        />

        <Text style={Styles.LawofficeName}>Doeman's Law Office</Text>

        <Text style={Styles.nameText}>John Doeman sqr</Text>

        <TouchableOpacity onPress={handleCall}>
          <Text style={Styles.phoneText}>{phnum}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
