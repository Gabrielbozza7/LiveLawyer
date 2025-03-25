import { Styles } from '@/constants/Styles'
import React, { useState } from 'react'
import { Alert, Button, Text, TouchableOpacity, Image, Dimensions } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

export default function Index() {
  const [times, setTimes] = useState<number>(0)
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const imageHeight = (screenWidth * 9) / 16;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={Styles.container}>
        <Text style={Styles.pageTitle}>Hub{'\n\n\n'}</Text>
        <TouchableOpacity
        onPress={() => {
          Alert.alert('You are now chatting with a lawyer!')
            setTimes(times + 1)
        }}
        >
          <Image source={require('@/assets/images/main-call-image.jpeg')}
            style={{ width: screenWidth, height: imageHeight }}
            resizeMode='contain'

          />
        </TouchableOpacity>
        <Text style={Styles.centeredText}>
          (Pretend the button works.){'\n\n\n\n\n'}You have called a lawyer {times} times.
        </Text>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
