'use client'
import { Colors } from '@/constants/Colors'
import { Button, Input } from '@rneui/themed'
import { useSession, useSupabaseClient } from 'livelawyerlibrary/context-manager'
import { useState } from 'react'
import { View, StyleSheet, Text, Alert } from 'react-native'

interface FormModel {
  firstName: string
  lastName: string
  phoneNumber: string
}

export default function CompleteRegistration() {
  const supabaseRef = useSupabaseClient()
  const sessionRef = useSession()
  const [loading, setLoading] = useState<boolean>(false)
  const [phoneNumberValid, setPhoneNumberValid] = useState<boolean>(false)

  const [formModel, setFormModel] = useState<FormModel>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
  })

  // Making changes based on the new account model when the form is submitted:
  const handleSubmit = async () => {
    setLoading(true)
    const { error: updateError } = await supabaseRef.current
      .from('User')
      .update({
        firstName: formModel.firstName,
        lastName: formModel.lastName,
        phoneNumber: formModel.phoneNumber,
        userType: 'Client',
      })
      .eq('id', sessionRef.current.user.id)
      .single()
    if (updateError) {
      Alert.alert(`Something went wrong when trying to update your info! Try again.`)
      setLoading(false)
      return
    }
    const {
      data: { session: newSession },
      error: sessionError,
    } = await supabaseRef.current.auth.refreshSession()
    if (sessionError || newSession === null) {
      Alert.alert(
        'Something went wrong when trying to retrieve your info! Try logging out and logging back in.',
      )
      return
    }
    setLoading(false)
  }

  return (
    <View style={styles.container}>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="First Name"
          onChangeText={text => setFormModel(prev => ({ ...prev, firstName: text }))}
          value={formModel.firstName}
          placeholder="First Name"
          autoCapitalize={'none'}
        />
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="Last Name"
          onChangeText={text => setFormModel(prev => ({ ...prev, lastName: text }))}
          value={formModel.lastName}
          placeholder="Last Name"
          autoCapitalize={'none'}
        />
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="Phone Number"
          onChangeText={text => {
            setFormModel(prev => ({ ...prev, phoneNumber: text }))
            setPhoneNumberValid(text.match(/^\+[1-9]\d{1,14}$/) ? true : false)
          }}
          value={formModel.phoneNumber}
          placeholder="+12223334444"
          autoCapitalize={'none'}
        />
      </View>

      <Text style={styles.text}>
        Phone number must conform to E.164 format: {phoneNumberValid ? '✔️' : '❌'}
      </Text>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button title="Confirm" disabled={loading || !phoneNumberValid} onPress={handleSubmit} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
  text: {
    color: Colors.white,
  },
})
