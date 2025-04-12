import { useState, useEffect } from 'react'
import { Colors } from '@/constants/Colors'
import { Styles } from '@/constants/Styles'
import { User } from '@supabase/supabase-js'
import { Alert, Button, Linking, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '../lib/supabase'

export default function Resources() {
  const handleOpenURL = () => {
    Linking.openURL('https://www.findlaw.com/traffic/traffic-tickets/state-traffic-laws.html')
  }
  // Get User Data
  const [user, setUser] = useState<User | null>(null)
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user)
      } else {
        console.log('Error while fetching user.')
      }
    })
  }, [])
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
        <View>
          <Text>{JSON.stringify(user, ['id'], 2)}</Text>
        </View>
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
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
