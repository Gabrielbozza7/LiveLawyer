import { FormEvent, useState } from 'react'
import { Button, Card, Form } from 'react-bootstrap'
import { AccountSubFormProps } from './account'

interface FormModel {
  firstName: string
  lastName: string
  email: string
  phoneNum: string
  password: string
  confirmPassword: string
}

export default function Creator({
  setLoading,
  setStatusMessage,
  setActiveForm,
  supabase,
}: AccountSubFormProps) {
  const [passwordsMatch, setPasswordsMatch] = useState<boolean>(true)
  const [passwordsLongEnough, setPasswordsLongEnough] = useState<boolean>(false)

  // There is blank data here because the value gets updated before ever being used.
  const [form, setForm] = useState<FormModel>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNum: '',
    password: '',
    confirmPassword: '',
  })

  // Dynamically syncing the form changes to the account model:
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let password = form.password
    let confirmPassword = form.confirmPassword
    setForm(prev => ({ ...prev, [name]: value }))
    if (name === 'password' || name === 'confirmPassword') {
      if (name === 'password') {
        password = value
      } else if (name === 'confirmPassword') {
        confirmPassword = value
      }
      setPasswordsMatch(password === confirmPassword)
      setPasswordsLongEnough(password.length >= 8 && confirmPassword.length >= 8)
    }
  }

  // Signing up based on the new account model when the form is submitted:
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })
    if (signUpError) {
      setStatusMessage('Something went wrong when trying to sign up! Try again.')
      return
    }
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()
    if (sessionError || session === null) {
      setStatusMessage('Something went wrong when trying to update your info! Try again.')
      return
    }
    const { error: updateError } = await supabase
      .from('User')
      .update({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phoneNum: form.phoneNum,
      })
      .eq('id', session.user.id)
      .single()
    if (updateError) {
      setStatusMessage('Something went wrong when trying to update your info! Try again.')
      return
    }
    setLoading(false)
    setActiveForm('Editor')
  }

  return (
    <Card>
      <Card.Header>Register New Account</Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formFirstName" className="mt-3">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="formLastName" className="mt-3">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="formEmail" className="mt-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" name="email" value={form.email} onChange={handleChange} />
          </Form.Group>

          <Form.Group controlId="formPhoneNum" className="mt-3">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              type="tel"
              name="phoneNum"
              value={form.phoneNum}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="formPassword" className="mt-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="formConfirmPassword" className="mt-3">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
            />
          </Form.Group>

          <Card.Text className="mt-3">
            Passwords must match: {passwordsMatch ? '✔️' : '❌'}
          </Card.Text>
          <Card.Text className="mt-3">
            Passwords must be at least 8 characters long: {passwordsLongEnough ? '✔️' : '❌'}
          </Card.Text>

          <Button
            variant="primary"
            type="submit"
            disabled={!(passwordsMatch && passwordsLongEnough)}
            className="mt-3"
          >
            Register
          </Button>
        </Form>
      </Card.Body>
    </Card>
  )
}
