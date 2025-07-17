'use client'
import { useAlerter, useSession, useSupabaseClient } from 'livelawyerlibrary/context-manager'
import { useState } from 'react'
import { View, StyleSheet, Text, ScrollView, Image } from 'react-native'
import { StandalonePage } from '../ui/standalone-page'
import { placeholderLogo } from '@/app/(tabs)/lawyers'
import { ValidatedForm } from 'livelawyerlibrary/forms/validated-form'
import { TextInput } from 'react-native-paper'
import { notEmpty, validatePhoneNumber } from 'livelawyerlibrary/input-validation'
import { ValidatedTextField } from 'livelawyerlibrary/forms/validated-text-field'
import { ValidatedFormSubmitButton } from 'livelawyerlibrary/forms/validated-form-submit-button'
import { FabWithConfirmation } from '../ui/fab-with-confirmation'
import { newStyles } from '@/constants/Styles'

interface FormModel {
  firstName: string
  lastName: string
  phoneNumber: string
}

export default function CompleteRegistration() {
  const supabaseRef = useSupabaseClient()
  const alerterRef = useAlerter()
  const sessionRef = useSession()
  const [loading, setLoading] = useState<boolean>(false)

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
      alerterRef.current.error(`Something went wrong when trying to update your info! Try again.`)
      setLoading(false)
      return
    }
    const {
      data: { session: newSession },
      error: sessionError,
    } = await supabaseRef.current.auth.refreshSession()
    if (sessionError || newSession === null) {
      alerterRef.current.error(
        'Something went wrong when trying to retrieve your info! Try logging out and logging back in.',
      )
      return
    }
    setLoading(false)
  }

  // Logout
  const logOut = async () => {
    const { error } = await supabaseRef.current.auth.signOut()
    if (error) {
      alerterRef.current.error(`Failed to log out: ${error.message}`)
    }
  }

  return (
    <StandalonePage title="Complete New Account Registration" disableBackButton={true}>
      <ScrollView>
        <View style={styles.logoContainer}>
          <Image style={styles.logo} source={placeholderLogo} resizeMode="contain" />
        </View>
        <ValidatedForm
          disabled={loading}
          model={formModel}
          setModel={setFormModel}
          onSubmit={handleSubmit}
        >
          <ValidatedTextField
            name="firstName"
            type="text"
            icon={<TextInput.Icon icon="account" />}
            label="First Name"
            validator={notEmpty}
            helperText="Value must not be empty."
            required
          />

          <ValidatedTextField
            name="lastName"
            type="text"
            icon={<TextInput.Icon icon="account" />}
            label="Last Name"
            validator={notEmpty}
            helperText="Value must not be empty."
            required
          />

          <ValidatedTextField
            name="phoneNumber"
            type="tel"
            icon={<TextInput.Icon icon="phone" />}
            label="Phone Number"
            validator={validatePhoneNumber}
            helperText="Type the 10 digits without punctuation (US numbers only)."
            required
          />

          <ValidatedFormSubmitButton>
            <Text>Confirm</Text>
          </ValidatedFormSubmitButton>
        </ValidatedForm>
      </ScrollView>
      <FabWithConfirmation
        icon="logout"
        prompt="Logout?"
        onConfirm={logOut}
        animateFrom="right"
        style={newStyles.bottomRightFab}
      />
    </StandalonePage>
  )
}

const styles = StyleSheet.create({
  logo: { height: '100%', aspectRatio: 1 },
  logoContainer: { width: '70%', aspectRatio: 1, alignSelf: 'center' },
})
