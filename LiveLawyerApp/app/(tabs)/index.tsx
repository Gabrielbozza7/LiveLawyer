import { Styles } from '@/constants/Styles'
import React, { useState } from 'react'
import { Alert, Button, Text } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

export default function Index() {
  const [times, setTimes] = useState<number>(0)
  return (
    <SafeAreaProvider>
      <SafeAreaView style={Styles.container}>
        <Text style={Styles.pageTitle}>Hub{'\n\n\n'}</Text>
        <Button
          title="PRESS ME TO CALL"
          onPress={() => {
            Alert.alert('You are now chatting with a lawyer!')
            setTimes(times + 1)
          }}
        />
        <Text style={Styles.centeredText}>
          (Pretend the button works.){'\n\n\n\n\n'}You have called a lawyer {times} times.
        </Text>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
