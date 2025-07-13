import { Colors } from '@/constants/Colors'
import { Styles } from '@/constants/Styles'
import { useAlerter, useSession, useSupabaseClient } from 'livelawyerlibrary/context-manager'
import { Button, Linking, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

export default function Resources() {
  const alerterRef = useAlerter()
  const supabaseRef = useSupabaseClient()
  const sessionRef = useSession()
  const handleOpenURL = () => {
    Linking.openURL('https://www.findlaw.com/traffic/traffic-tickets/state-traffic-laws.html')
  }
  // Logout
  const logOut = async () => {
    const { error } = await supabaseRef.current.auth.signOut()
    if (error) {
      alerterRef.current.error(`Failed to log out: ${error.message}`)
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
          <Text>{sessionRef.current.user.id}</Text>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
