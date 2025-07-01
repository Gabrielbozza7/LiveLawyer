import { useSupabaseClient } from 'livelawyerlibrary/context-manager'
import { FormEvent, useState } from 'react'
import { Button, Card, Form, Toast } from 'react-bootstrap'

interface FormModel {
  email: string
  password: string
}

export default function Login() {
  const supabaseRef = useSupabaseClient()
  const [loading, setLoading] = useState<boolean>(false)
  const [showToast, setShowToast] = useState<string | null>(null)
  const [formModel, setFormModel] = useState<FormModel>({
    email: '',
    password: '',
  })

  // Dynamically syncing the form changes to the account model:
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormModel(prev => ({ ...prev, [name]: value }))
  }

  // Logging in based on the new account model when the form is submitted:
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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

  return (
    <Card>
      <Card.Header>Login</Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
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

          <Button disabled={loading} variant="success" type="submit" className="mt-3">
            Login
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
