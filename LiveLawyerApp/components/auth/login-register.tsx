import { useAlerter, useSupabaseClient } from 'livelawyerlibrary/context-manager'
import { useState } from 'react'
import { StandalonePage } from '../ui/standalone-page'
import { ValidatedForm } from 'livelawyerlibrary/forms/validated-form'
import { ValidatedTextField } from 'livelawyerlibrary/forms/validated-text-field'
import { SegmentedButtons, Text, TextInput } from 'react-native-paper'
import { validateEmail, validatePassword } from 'livelawyerlibrary/input-validation'
import { ValidatedFormSubmitButton } from 'livelawyerlibrary/forms/validated-form-submit-button'
import { Image, ScrollView, StyleSheet, View } from 'react-native'
import { placeholderLogo } from '@/app/(tabs)/lawyers'

type ActiveTab = 'Login' | 'Register'

interface FormModel {
  email: string
  password: string
  confirmPassword: string
}

export default function LoginRegister() {
  const supabaseRef = useSupabaseClient()
  const alerterRef = useAlerter()
  const [activeTab, setActiveTab] = useState<ActiveTab>('Login')
  const [loading, setLoading] = useState<boolean>(false)

  const [formModel, setFormModel] = useState<FormModel>({
    email: '',
    password: '',
    confirmPassword: '',
  })

  // Logging in or signing up based on new account model when a form is submitted:
  const handleSubmit = async (model: object) => {
    const formModel = model as FormModel
    setLoading(true)
    switch (activeTab) {
      case 'Login': {
        const { error } = await supabaseRef.current.auth.signInWithPassword({
          email: formModel.email,
          password: formModel.password,
        })
        if (error) {
          if (error.code === 'invalid_credentials') {
            alerterRef.current.error('Invalid credentials. Try again.')
          } else {
            alerterRef.current.error('Something went wrong when trying to sign in! Try again.')
          }
        }
        break
      }
      case 'Register': {
        const { error: signUpError } = await supabaseRef.current.auth.signUp({
          email: formModel.email,
          password: formModel.password,
        })
        if (signUpError) {
          alerterRef.current.error(
            `Something went wrong when trying to register! Try again. (${signUpError.message})`,
          )
        }
        break
      }
    }
    setLoading(false)
  }

  return (
    <StandalonePage title={activeTab} disableBackButton={true}>
      <ScrollView>
        <View style={styles.logoContainer}>
          <Image style={styles.logo} source={placeholderLogo} resizeMode="contain" />
        </View>
        <SegmentedButtons
          value={activeTab}
          onValueChange={setActiveTab}
          buttons={[
            {
              value: 'Login',
              label: 'Login',
            },
            {
              value: 'Register',
              label: 'Register',
            },
          ]}
          density="small"
          style={styles.tabs}
        />
        <ValidatedForm
          disabled={loading}
          model={formModel}
          setModel={setFormModel}
          onSubmit={handleSubmit}
        >
          <ValidatedTextField
            name="email"
            type="email"
            icon={<TextInput.Icon icon="email" />}
            label="Email"
            validator={validateEmail}
            helperText="Email must reflect the structure of a real email address."
            required
          />

          <ValidatedTextField
            name="password"
            type="password"
            icon={<TextInput.Icon icon="key" />}
            label="Password"
            validator={validatePassword}
            helperText="Passwords must be at least 8 characters long."
            required
          />

          {activeTab === 'Register' && (
            <ValidatedTextField
              name="confirmPassword"
              type="password"
              icon={<TextInput.Icon icon="key" />}
              label="Confirm Password"
              validator={() => formModel.password === formModel.confirmPassword}
              helperText="Passwords must match."
              required
            />
          )}

          <ValidatedFormSubmitButton>
            <Text>{activeTab}</Text>
          </ValidatedFormSubmitButton>
        </ValidatedForm>
      </ScrollView>
    </StandalonePage>
  )
}

const styles = StyleSheet.create({
  logo: { height: '100%', aspectRatio: 1 },
  logoContainer: { width: '70%', aspectRatio: 1, alignSelf: 'center' },
  tabs: { margin: 24 },
})
