'use client'
import { Button, Card, Container, Form, Toast } from 'react-bootstrap'
import { FormEvent, useState } from 'react'
import { useSupabaseClient } from 'livelawyerlibrary/context-manager'

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
  const [registerPasswordsMatch, setRegisterPasswordsMatch] = useState<boolean>(true)
  const [registerPasswordsLongEnough, setRegisterPasswordsLongEnough] = useState<boolean>(false)

  const [formModel, setFormModel] = useState<FormModel>({
    email: '',
    password: '',
    confirmPassword: '',
  })

  // Dynamically syncing the form changes to the account model:
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let password = formModel.password
    let confirmPassword = formModel.confirmPassword
    setFormModel(prev => ({ ...prev, [name]: value }))
    if (name === 'password' || name === 'confirmPassword') {
      if (name === 'password') {
        password = value
      } else if (name === 'confirmPassword') {
        confirmPassword = value
      }
      setRegisterPasswordsMatch(password === confirmPassword)
      setRegisterPasswordsLongEnough(password.length >= 8 && confirmPassword.length >= 8)
    }
  }

  // Logging in based on the new account model when the Login form is submitted:
  const handleSubmitLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
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
    setLoading(false)
  }

  // Signing up based on the new account model when the Register form is submitted:
  const handleSubmitRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const { error: signUpError } = await supabaseRef.current.auth.signUp({
      email: formModel.email,
      password: formModel.password,
    })
    if (signUpError) {
      setShowToast(
        `Something went wrong when trying to register! Try again. (${signUpError.message})`,
      )
    }
    setLoading(false)
  }

  return (
    <>
      <title>Login/Register</title>
      <Container fluid="md" style={{ margin: 24 }}>
        <Button variant="primary" onClick={() => setActiveForm('Login')} className="mt-3">
          Login
        </Button>
        <Button variant="primary" onClick={() => setActiveForm('Register')} className="mt-3">
          Register
        </Button>
        <Card>
          <Card.Header>{activeForm}</Card.Header>
          <Card.Body>
            <Form onSubmit={activeForm === 'Login' ? handleSubmitLogin : handleSubmitRegister}>
              <Form.Group controlId="formEmail" className="mt-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  disabled={loading}
                  type="email"
                  name="email"
                  value={formModel.email}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group controlId="formPassword" className="mt-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  disabled={loading}
                  type="password"
                  name="password"
                  value={formModel.password}
                  onChange={handleChange}
                />
              </Form.Group>

              {activeForm === 'Register' && (
                <>
                  <Form.Group controlId="formConfirmPassword" className="mt-3">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                      disabled={loading}
                      type="password"
                      name="confirmPassword"
                      value={formModel.confirmPassword}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Card.Text className="mt-3">
                    Passwords must match: {registerPasswordsMatch ? '✔️' : '❌'}
                  </Card.Text>
                  <Card.Text className="mt-3">
                    Passwords must be at least 8 characters long:{' '}
                    {registerPasswordsLongEnough ? '✔️' : '❌'}
                  </Card.Text>
                </>
              )}

              <Button
                disabled={
                  loading ||
                  (activeForm === 'Register' &&
                    !(registerPasswordsMatch && registerPasswordsLongEnough))
                }
                variant="success"
                type="submit"
                className="mt-3"
              >
                {activeForm}
              </Button>
            </Form>
          </Card.Body>
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
