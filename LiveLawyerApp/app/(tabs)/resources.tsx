import { Styles } from '@/constants/Styles'
import { Linking, Text, TouchableOpacity } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

export default function Resources() {

  const handleOpenURL = () => {
    Linking.openURL('https://www.findlaw.com/traffic/traffic-tickets/state-traffic-laws.html')
  }
  return (
    <SafeAreaProvider>
      <SafeAreaView style={Styles.container}>
        <TouchableOpacity onPress={handleOpenURL}>
        <Text style={Styles.pageTitle}>Traffic Laws for All States</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
