import { useEffect, useState } from 'react'
import { View, Text, TextInput, Button, ActivityIndicator, Alert } from 'react-native'
import { Styles } from '@/constants/Styles'
import { Database } from 'livelawyerlibrary/database-types'
import { useSessionData, useSupabaseClient } from '../components/context-manager'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

export default function EditContact() {
  const supabase = useSupabaseClient()
  const { userId } = useSessionData()
  const { id }: { id: string | undefined } = useLocalSearchParams() as { id: string | undefined }
  const [contactModel, setContactModel] = useState<
    Database['public']['Tables']['Contact']['Insert']
  >({ userId, name: '', phoneNumber: '+1' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      if (id !== undefined) {
        const { data: contact, error } = await supabase
          .from('Contact')
          .select()
          .eq('id', id)
          .single()

        if (contact) {
          setContactModel(contact)
        }
        if (error) console.error('Contact table error:', error)
      }
      setLoading(false)
    })()
  }, [id])

  const handleSave = async () => {
    setLoading(true)
    const { error } = await supabase.from('Contact').upsert(contactModel)
    setLoading(false)

    if (error) {
      console.error('Update error:', error)
      Alert.alert('Error', 'Could not update contacts!')
    } else {
      Alert.alert('Success', 'Contacts updated!')
    }
    router.back()
  }

  const handleDelete = async () => {
    if (id === undefined) {
      return
    }
    setLoading(true)
    const { error } = await supabase.from('Contact').delete().eq('id', id)
    setLoading(false)

    if (error) {
      console.error('Delete error:', error)
      Alert.alert('Error', 'Could not delete contact!')
    } else {
      Alert.alert('Success', 'Contact deleted!')
    }
    router.back()
  }

  if (loading) {
    return (
      <View style={Styles.LawyerInfoContainer}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={Styles.profPageContainer}>
        <Text style={Styles.profPageTitle}>{id === undefined ? 'New' : 'Edit'} Contact</Text>
        {contactModel && (
          <>
            <Text style={Styles.profItemText}>Name:</Text>
            <TextInput
              style={Styles.profInput}
              placeholder="Name"
              value={contactModel.name}
              editable={!loading}
              onChangeText={text => setContactModel({ ...contactModel, name: text })}
            />
            <Text style={Styles.profItemText}>Phone Number (+1):</Text>
            <TextInput
              style={Styles.profInput}
              placeholder="Phone Number"
              value={contactModel.phoneNumber.substring(2)}
              onChangeText={text => setContactModel({ ...contactModel, phoneNumber: '+1' + text })}
              editable={!loading}
              keyboardType="phone-pad"
            />
            <View style={Styles.profButtonGroup}>
              <Button
                title={loading ? 'Saving...' : 'Save'}
                onPress={handleSave}
                disabled={loading}
              />
              {id !== undefined && (
                <Button title="Delete" onPress={handleDelete} disabled={loading} color="red" />
              )}
              <Button title="Cancel" onPress={() => router.back()} color="gray" />
            </View>
          </>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
