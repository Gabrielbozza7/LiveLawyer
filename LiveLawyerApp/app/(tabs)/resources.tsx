import { Colors } from '@/constants/Colors'
import { Styles } from '@/constants/Styles'
import { Alert, Button, Linking, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

export default function Resources() {
  const handleOpenURL = () => {
    Linking.openURL('https://www.findlaw.com/traffic/traffic-tickets/state-traffic-laws.html')
  }
  return (
    <SafeAreaProvider>
      <SafeAreaView style={Styles.LawyerInfoContainer}>
        <View style={Styles.itemInfoBox}>
          <TouchableOpacity onPress={handleOpenURL}>
            <Text style={Styles.pageTitle}>Traffic Laws for All States</Text>
          </TouchableOpacity>
        </View>
        <View style={Styles.itemInfoBox}>
          <Button
            onPress={() => {
              Alert.alert('Contact button pressed.')
            }}
            title="Signup"
            color={Colors.white}
            accessibilityLabel="Yay you signed up lol"
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
