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
  userType: 'Observer' | 'Lawyer'
}

export default function Creator({
  loading,
  setLoading,
  setStatusMessage,
  setActiveForm,
  supabase,
}: AccountSubFormProps) {
  const [passwordsMatch, setPasswordsMatch] = useState<boolean>(true)
  const [passwordsLongEnough, setPasswordsLongEnough] = useState<boolean>(false)

  const [formModel, setFormModel] = useState<FormModel>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNum: '',
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
    const { error: signUpError } = await supabase.auth.signUp({
      email: formModel.email,
      password: formModel.password,
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
        firstName: formModel.firstName,
        lastName: formModel.lastName,
        email: formModel.email,
        phoneNum: formModel.phoneNum,
        userType: formModel.userType,
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

          <Form.Group controlId="formPhoneNum" className="mt-3">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              disabled={loading}
              type="tel"
              name="phoneNum"
              value={formModel.phoneNum}
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
    </Card>
  )
}
