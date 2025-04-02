import React from 'react'
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  AppState,
} from 'react-native'
import Fontisto from '@expo/vector-icons/Fontisto'
import AntDesign from '@expo/vector-icons/AntDesign'
import { supabase } from '../lib/supabase'

AppState.addEventListener('change', state => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

const LoginScreen = () => {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  async function signInWithEmail() {
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })
    if (error) Alert.alert(error.message)
    setLoading(false)
  }

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center' }}>
      <View style={{ paddingHorizontal: 25, width: '93%', alignSelf: 'center' }}>
        <Text style={{ fontSize: 28, fontWeight: 500, marginBottom: 30 }}>Login</Text>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}></View>
        <View
          style={{ flexDirection: 'row', borderBottomWidth: 1, paddingBottom: 9, marginBottom: 20 }}
        >
          <Fontisto name="email" size={20} style={{ marginRight: 7 }} />
          <TextInput
            placeholder="email"
            style={{ flex: 1, paddingVertical: 0 }}
            keyboardType="email-address"
            onChangeText={newEmailInput => setEmail(newEmailInput)}
          />
        </View>
        <View
          style={{ flexDirection: 'row', borderBottomWidth: 1, paddingBottom: 9, marginBottom: 20 }}
        >
          <AntDesign name="lock" size={20} style={{ marginRight: 7 }} />
          <TextInput
            placeholder="password"
            style={{ flex: 1, paddingVertical: 0 }}
            secureTextEntry={true}
            onChangeText={newPassInput => setPassword(newPassInput)}
          />
          {/* Button for When users forget their passwords  */}
          <TouchableOpacity onPress={() => {}}>
            <Text style={{ color: '#1e7494' }}>Forgot</Text>
          </TouchableOpacity>
        </View>
        {/* Button for logging in */}
        <TouchableOpacity
          disabled={loading}
          onPress={() => {
            signInWithEmail()
          }}
          style={{ backgroundColor: '#961e06', padding: 20, borderRadius: 10, marginBottom: 30 }}
        >
          <Text style={{ textAlign: 'center', fontWeight: '700', fontSize: 16, color: '#FFFFFF' }}>
            Login
          </Text>
        </TouchableOpacity>

        <View>
          <Text style={{ fontSize: 20, fontWeight: 500, marginBottom: 5, marginRight: 15 }}>
            New to the app?
          </Text>
          {/* Button for registering in */}
          <TouchableOpacity onPress={() => {}}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: 500,
                marginBottom: 30,
                color: '#1e7494',
                marginRight: 15,
              }}
            >
              Register
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default LoginScreen
