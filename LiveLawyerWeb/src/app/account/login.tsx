import { FormEvent, useEffect, useState } from 'react'
import { Button, Card, Form } from 'react-bootstrap'
import { AccountSubFormProps } from './account'

interface FormModel {
  email: string
  password: string
}

export default function Login({
  setLoading,
  setStatusMessage,
  setActiveForm,
  supabase,
  session,
}: AccountSubFormProps) {
  const [formModel, setFormModel] = useState<FormModel>({
    email: '',
    password: '',
  })

  // Redirecting to Editor when the user is already logged in:
  useEffect(() => {
    if (session !== undefined) {
      setActiveForm('Editor')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Dynamically syncing the form changes to the account model:
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormModel(prev => ({ ...prev, [name]: value }))
  }

  // Logging in based on the new account model when the form is submitted:
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: formModel.email,
      password: formModel.password,
    })
    if (error) {
      setStatusMessage('Something went wrong when trying to sign up! Try again.')
    }
    setActiveForm('Editor')
    setLoading(false)
  }

  const handleCreateAccountClick = () => {
    setActiveForm('Creator')
  }

  return (
    <Card>
      <Card.Header>Login</Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formEmail" className="mt-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formModel.email}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="formPassword" className="mt-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formModel.password}
              onChange={handleChange}
            />
          </Form.Group>

          <Button variant="success" type="submit" className="mt-3">
            Login
          </Button>

          <Card.Text className="mt-3">Don&apos;t have an account? Create one!</Card.Text>

          <Button variant="primary" onClick={handleCreateAccountClick} className="mt-3">
            Register New Account
          </Button>
        </Form>
      </Card.Body>
    </Card>
  )
}
