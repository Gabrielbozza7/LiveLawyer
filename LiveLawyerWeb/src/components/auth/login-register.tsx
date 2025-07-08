'use client'
import { Toast } from 'react-bootstrap'
import { useState } from 'react'
import { useSupabaseClient } from 'livelawyerlibrary/context-manager'
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

export type ActiveSessionlessForm = 'Login' | 'Register'

interface FormModel {
  email: string
  password: string
  confirmPassword: string
}

export default function LoginRegister() {
  const [activeForm, setActiveForm] = useState<ActiveSessionlessForm>('Login')
  const supabaseRef = useSupabaseClient()
  const [loading, setLoading] = useState<boolean>(false)
  const [showToast, setShowToast] = useState<string | null>(null)

  const [formModel, setFormModel] = useState<FormModel>({
    email: '',
    password: '',
    confirmPassword: '',
  })

  // Logging in or signing up based on new account model when a form is submitted:
  const handleSubmit = async (model: object) => {
    const formModel = model as FormModel
    setLoading(true)
    switch (activeForm) {
      case 'Login': {
        const { error } = await supabaseRef.current.auth.signInWithPassword({
          email: formModel.email,
          password: formModel.password,
        })
        if (error) {
          if (error.code === 'invalid_credentials') {
            setShowToast('Invalid credentials. Try again.')
          } else {
            setShowToast('Something went wrong when trying to sign in! Try again.')
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
          setShowToast(
            `Something went wrong when trying to register! Try again. (${signUpError.message})`,
          )
        }
        break
      }
    }
    setLoading(false)
  }

  const possibleForms: ActiveSessionlessForm[] = ['Login', 'Register']
  const handleTabSwitch = (event: React.SyntheticEvent, index: number) => {
    setActiveForm(possibleForms[index])
  }
  return (
    <>
      <title>Login/Register</title>
      <Container maxWidth="sm" sx={{ marginTop: 4 }}>
        <Card variant="outlined" sx={{ padding: 1 }}>
          <CardContent>
            <Stack spacing={4}>
              <Tabs
                value={possibleForms.findIndex(x => x === activeForm)}
                onChange={handleTabSwitch}
              >
                <Tab label="Login" />
                <Tab label="Register" />
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

                {activeForm === 'Register' && (
                  <ValidatedTextField
                    name="confirmPassword"
                    type="password"
                    icon={<KeyIcon />}
                    label="Confirm Password"
                    validator={() => formModel.password === formModel.confirmPassword}
                    helperText="Passwords must match."
                  />
                )}

                <ValidatedFormSubmitButton color="success">{activeForm}</ValidatedFormSubmitButton>
              </ValidatedForm>
            </Stack>
          </CardContent>
          <Toast
            bg="danger"
            onClose={() => setShowToast(null)}
            show={showToast !== null}
            delay={2500}
            autohide
          >
            <Toast.Body>{showToast}</Toast.Body>
          </Toast>
        </Card>
      </Container>
    </>
  )
}
