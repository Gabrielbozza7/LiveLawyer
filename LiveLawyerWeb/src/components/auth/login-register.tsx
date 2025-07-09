'use client'
import { useState } from 'react'
import { useAlerter, useSupabaseClient } from 'livelawyerlibrary/context-manager'
import { validateEmail, validatePassword } from 'livelawyerlibrary/input-validation'
import EmailIcon from '@mui/icons-material/Email'
import KeyIcon from '@mui/icons-material/Key'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Container from '@mui/material/Container'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import { ValidatedForm } from '../forms/validated-form'
import { ValidatedTextField } from '../forms/validated-text-field'
import { ValidatedFormSubmitButton } from '../forms/validated-form-submit-button'

const POSSIBLE_TABS = ['Login', 'Register'] as const
type ActiveSessionlessTab = (typeof POSSIBLE_TABS)[number]

interface FormModel {
  email: string
  password: string
  confirmPassword: string
}

export default function LoginRegister() {
  const supabaseRef = useSupabaseClient()
  const alerterRef = useAlerter()
  const [activeTab, setActiveTab] = useState<ActiveSessionlessTab>('Login')
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
    <>
      <title>Login/Register</title>
      <Container maxWidth="sm" sx={{ marginTop: 4 }}>
        <Card variant="outlined" sx={{ padding: 1 }}>
          <CardContent>
            <Stack spacing={4}>
              <Tabs
                value={POSSIBLE_TABS.findIndex(x => x === activeTab)}
                onChange={(event, index) => setActiveTab(POSSIBLE_TABS[index])}
              >
                {POSSIBLE_TABS.map(tab => (
                  <Tab key={tab} label={tab} />
                ))}
              </Tabs>
              <ValidatedForm
                disabled={loading}
                model={formModel}
                setModel={setFormModel}
                onSubmit={handleSubmit}
              >
                <ValidatedTextField
                  name="email"
                  type="email"
                  icon={<EmailIcon />}
                  label="Email"
                  validator={validateEmail}
                  helperText="Email must reflect the structure of a real email address."
                  required
                />

                <ValidatedTextField
                  name="password"
                  type="password"
                  icon={<KeyIcon />}
                  label="Password"
                  validator={validatePassword}
                  helperText="Passwords must be at least 8 characters long."
                />

                {activeTab === 'Register' && (
                  <ValidatedTextField
                    name="confirmPassword"
                    type="password"
                    icon={<KeyIcon />}
                    label="Confirm Password"
                    validator={() => formModel.password === formModel.confirmPassword}
                    helperText="Passwords must match."
                  />
                )}

                <ValidatedFormSubmitButton color="success">{activeTab}</ValidatedFormSubmitButton>
              </ValidatedForm>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </>
  )
}
