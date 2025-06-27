import { Colors } from '@/constants/Colors'
import { Styles } from '@/constants/Styles'
import { Alert, Button, Linking, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { useSessionData, useSupabaseClient } from '../components/context-manager'

export default function Resources() {
  const supabase = useSupabaseClient()
  const { userId } = useSessionData()
  const handleOpenURL = () => {
    Linking.openURL('https://www.findlaw.com/traffic/traffic-tickets/state-traffic-laws.html')
  }
  // Logout
  const logOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      Alert.alert('Failed to log out.', error.message)
    }
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
              logOut()
            }}
            title="Log Out"
            color={Colors.white}
            accessibilityLabel="Log out from the application."
          />
        </View>
        <View>
          <Text>{userId}</Text>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
