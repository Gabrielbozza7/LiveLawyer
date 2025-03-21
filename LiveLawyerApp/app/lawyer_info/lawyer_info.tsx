import React from 'react'
import { Text, TouchableOpacity, Image } from 'react-native'
import { Styles } from '@/constants/Styles'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import Lawyer from '../lawyer';

const reactLogo = require('../../assets/images/react-logo.png');

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

        <Text style={Styles.LawofficeName}>{lawyer.office}</Text>

        <Text style={Styles.nameText}>{lawyer.title}</Text>

        <TouchableOpacity onPress={handleCall}>
          <Text style={Styles.phoneText}>{lawyer.number}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
