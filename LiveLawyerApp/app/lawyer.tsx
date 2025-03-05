import { Styles } from '@/constants/Styles'
import { Text } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

export default function Lawyer() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={Styles.container}>
        <Text style={Styles.pageTitle}>Screen template!</Text>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
