import { Styles } from '@/constants/Styles'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Text, TouchableOpacity, Image } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

export default function Index() {
  const router = useRouter()
  const [times, setTimes] = useState<number>(0)

  const attemptCall = async (): Promise<boolean> => {
    try {
      setTimes(times + 1)
      router.navigate(`/call`)
      return true
    } catch (error: unknown) {
      console.log(`POST error: ${(error as Error).message}`)
      return false
    }
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={Styles.container}>
        <Text style={Styles.pageTitle}>{'\n\n\n'}</Text>
        <TouchableOpacity onPress={attemptCall}>
          <Image
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            source={require('@/assets/images/main-call-image.jpeg')}
            style={Styles.mainLogoButton}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={Styles.centeredText}>Press the Logo To Call A Lawyer.</Text>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
