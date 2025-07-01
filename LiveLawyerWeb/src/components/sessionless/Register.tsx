import { useSupabaseClient } from 'livelawyerlibrary/context-manager'
import { FormEvent, useState } from 'react'
import { Button, Card, Form, Toast } from 'react-bootstrap'

interface FormModel {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  password: string
  confirmPassword: string
  userType: 'Observer' | 'Lawyer'
}

export default function Register() {
  const supabaseRef = useSupabaseClient()
  const [loading, setLoading] = useState<boolean>(false)
  const [showToast, setShowToast] = useState<string | null>(null)
  const [passwordsMatch, setPasswordsMatch] = useState<boolean>(true)
  const [passwordsLongEnough, setPasswordsLongEnough] = useState<boolean>(false)

  const [formModel, setFormModel] = useState<FormModel>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    userType: 'Observer',
  })

  // Dynamically syncing the form changes to the account model:
  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setPasswordsMatch(password === confirmPassword)
      setPasswordsLongEnough(password.length >= 8 && confirmPassword.length >= 8)
    }
  }

  // Dynamically syncing the form changes to the account model:
  const handleChangeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormModel(prev => ({ ...prev, [name]: value }))
  }

  // Signing up based on the new account model when the form is submitted:
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const { error: signUpError } = await supabaseRef.current.auth.signUp({
      email: formModel.email,
      password: formModel.password,
    })
    if (signUpError) {
      setShowToast('Something went wrong when trying to sign up! Try again.')
      return
    }
    const {
      data: { session },
      error: sessionError,
    } = await supabaseRef.current.auth.getSession()
    if (sessionError || session === null) {
      // TODO: This currently results in the database entry being messed up; replace with something safer if this happens.
      setShowToast('Something went wrong when trying to update your info!')
      return
    }
    const { error: updateError } = await supabaseRef.current
      .from('User')
      .update({
        firstName: formModel.firstName,
        lastName: formModel.lastName,
        email: formModel.email,
        phoneNumber: formModel.phoneNumber,
        userType: formModel.userType,
      })
      .eq('id', session.user.id)
      .single()
    if (updateError) {
      setShowToast('Something went wrong when trying to update your info! Try again.')
      return
    }
    setLoading(false)
  }

  return (
    <Card>
      <Card.Header>Register New Account</Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formFirstName" className="mt-3">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              disabled={loading}
              type="text"
              name="firstName"
              value={formModel.firstName}
              onChange={handleChangeInput}
            />
          </Form.Group>

          <Form.Group controlId="formLastName" className="mt-3">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              disabled={loading}
              type="text"
              name="lastName"
              value={formModel.lastName}
              onChange={handleChangeInput}
            />
          </Form.Group>

          <Form.Group controlId="formEmail" className="mt-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              disabled={loading}
              type="email"
              name="email"
              value={formModel.email}
              onChange={handleChangeInput}
            />
          </Form.Group>

          <Form.Group controlId="formPhoneNumber" className="mt-3">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              disabled={loading}
              type="tel"
              name="phoneNumber"
              value={formModel.phoneNumber}
              onChange={handleChangeInput}
            />
          </Form.Group>

          <Form.Group controlId="formPassword" className="mt-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              disabled={loading}
              type="password"
              name="password"
              value={formModel.password}
              onChange={handleChangeInput}
            />
          </Form.Group>

          <Form.Group controlId="formConfirmPassword" className="mt-3">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              disabled={loading}
              type="password"
              name="confirmPassword"
              value={formModel.confirmPassword}
              onChange={handleChangeInput}
            />
          </Form.Group>

          <Form.Group controlId="formUserType" className="mt-3">
            <Form.Label>User Type</Form.Label>
            <Form.Select
              disabled={loading}
              name="userType"
              value={formModel.userType}
              onChange={handleChangeSelect}
            >
              <option>Observer</option>
              <option>Lawyer</option>
            </Form.Select>
          </Form.Group>

          <Card.Text className="mt-3">
            Passwords must match: {passwordsMatch ? '✔️' : '❌'}
          </Card.Text>
          <Card.Text className="mt-3">
            Passwords must be at least 8 characters long: {passwordsLongEnough ? '✔️' : '❌'}
          </Card.Text>

          <Button
            disabled={loading || !(passwordsMatch && passwordsLongEnough)}
            variant="primary"
            type="submit"
            className="mt-3"
          >
            Register
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
  )
}
