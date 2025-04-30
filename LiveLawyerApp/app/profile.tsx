import { useEffect, useState } from 'react'
import { View, Text, TextInput, Button, ActivityIndicator, Alert } from 'react-native'
import { supabase } from './lib/supabase'
import { Styles } from '@/constants/Styles'

export default function Profile() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [userInfo, setUserInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    const getUserInfo = async () => {
      const {
        data: { user },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        error: authError,
      } = await supabase.auth.getUser()

      if (user) {
        const { data: userData, error: userError } = await supabase
          .from('User')
          .select('*')
          .eq('id', user.id)
          .single()

        if (userData) setUserInfo(userData)
        if (userError) console.error('User table error:', userError)
      }

      setLoading(false)
    }

    getUserInfo()
  }, [])

  const handleSave = async () => {
    if (!userInfo) return
    setSaving(true)

    const { error } = await supabase
      .from('User')
      .update({
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        phoneNum: userInfo.phoneNum,
      })
      .eq('id', userInfo.id)

    setSaving(false)

    if (error) {
      console.error('Update error:', error)
      Alert.alert('Error', 'Could not update profile.')
    } else {
      Alert.alert('Success', 'Profile updated!')
      setEditing(false)
    }
  }

  if (loading) {
    return (
      <View style={Styles.LawyerInfoContainer}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!userInfo) {
    return (
      <View style={Styles.LawyerInfoContainer}>
        <Text style={Styles.centeredText}>No user found.</Text>
      </View>
    )
  }

  return (
    <View style={Styles.profPageContainer}>
      <Text style={Styles.profPageTitle}>My Profile</Text>

      {editing ? (
        <>
          <TextInput
            style={Styles.profInput}
            placeholder="First Name"
            value={userInfo.firstName}
            onChangeText={text => setUserInfo({ ...userInfo, firstName: text })}
          />
          <TextInput
            style={Styles.profInput}
            placeholder="Last Name"
            value={userInfo.lastName}
            onChangeText={text => setUserInfo({ ...userInfo, lastName: text })}
          />
          <TextInput
            style={Styles.profInput}
            placeholder="Phone Number"
            value={userInfo.phoneNum}
            onChangeText={text => setUserInfo({ ...userInfo, phoneNum: text })}
            keyboardType="phone-pad"
          />
          <View style={Styles.profButtonGroup}>
            <Button
              title={saving ? 'Saving...' : 'Save Changes'}
              onPress={handleSave}
              disabled={saving}
            />
            <Button title="Cancel" onPress={() => setEditing(false)} color="gray" />
          </View>
        </>
      ) : (
        <>
          <Text style={Styles.profItemText}>First Name: {userInfo.firstName}</Text>
          <Text style={Styles.profItemText}>Last Name: {userInfo.lastName}</Text>
          <Text style={Styles.profItemText}>Phone: {userInfo.phoneNum}</Text>
          <View style={Styles.profEditButton}>
            <Button title="Edit Profile" onPress={() => setEditing(true)} />
          </View>
        </>
      )}
    </View>
  )
}
