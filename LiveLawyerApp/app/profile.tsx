import { useEffect, useState } from 'react'
import { View, Text, TextInput, Button, ActivityIndicator, Alert } from 'react-native'
import { Styles } from '@/constants/Styles'
import { useSessionData, useSupabaseClient } from './components/context-manager'
import { Database } from 'livelawyerlibrary/database-types'

export default function Profile() {
  const supabase = useSupabaseClient()
  const { userId } = useSessionData()
  const [userInfo, setUserInfo] = useState<Database['public']['Tables']['User']['Row'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    ;(async () => {
      const { data: userData, error: userError } = await supabase
        .from('User')
        .select()
        .eq('id', userId)
        .single()

      if (userData) setUserInfo(userData)
      if (userError) console.error('User table error:', userError)

      setLoading(false)
    })()
  }, [])

  const handleSave = async () => {
    if (!userInfo) return
    setSaving(true)

    const { error } = await supabase
      .from('User')
      .update({
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        phoneNumber: userInfo.phoneNumber,
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
            value={userInfo.phoneNumber}
            onChangeText={text => setUserInfo({ ...userInfo, phoneNumber: text })}
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
          <View style={Styles.profItemText}>
            <Text style={Styles.profItemText}>Name:</Text>
            <Text style={Styles.profDisplay}>
              {userInfo.firstName} {userInfo.lastName}
            </Text>
          </View>
          <View style={Styles.profItemText}>
            <Text style={Styles.profItemText}>Phone:</Text>
            <Text style={Styles.profDisplay}>{userInfo.phoneNumber}</Text>
          </View>
          <View style={Styles.profEditButton}>
            <Button title="Edit Profile" onPress={() => setEditing(true)} />
          </View>
        </>
      )}
    </View>
  )
}
