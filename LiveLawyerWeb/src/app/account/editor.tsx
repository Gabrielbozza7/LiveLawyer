import { FormEvent, useEffect, useState } from 'react'
import { Button, Card, Form } from 'react-bootstrap'
import { AccountSubFormProps } from './account'

interface FormModel {
  firstName: string
  lastName: string
  email: string
  phoneNum: string
}

export default function Editor({
  setLoading,
  setStatusMessage,
  setActiveForm,
  supabase,
  session,
}: AccountSubFormProps) {
  const [userType, setUserType] = useState<string>('')

  const [formModel, setFormModel] = useState<FormModel>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNum: '',
  })

  // Filling the form with the user's existing data before presenting it for editing:
  useEffect(() => {
    if (session !== undefined) {
      ;(async () => {
        setLoading(true)
        const { data, error } = await supabase
          .from('User')
          .select()
          .eq('id', session?.user.id ?? '')
          .single()
        if (error || data === null) {
          setStatusMessage(
            'Something went wrong when trying to fetch your account information! Try again later.',
          )
        } else {
          setFormModel(data)
          setUserType(data.userType)
        }
        setLoading(false)
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Dynamically syncing the form changes to the account model:
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormModel(prev => ({ ...prev, [name]: value }))
  }

  // Updating the database based on the new account model when the form is submitted:
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase
      .from('User')
      .update(formModel)
      .eq('id', session?.user.id ?? '')
      .single()
    setStatusMessage(
      error
        ? 'Something went wrong when trying to fetch your account information! Try again later.'
        : 'Update successful!',
    )
    setLoading(false)
  }

  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    setLoading(true)
    try {
      await supabase.auth.signOut()
    } catch {
      setStatusMessage('Something went wrong when trying to log out! Try again later.')
    } finally {
      setLoading(false)
      setActiveForm('Login')
    }
  }

  return (
    <Card>
      <Card.Body>
        <h4 className="mb-4">Account Information</h4>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formFirstName" className="mt-3">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              name="firstName"
              value={formModel.firstName}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="formLastName" className="mt-3">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              type="text"
              name="lastName"
              value={formModel.lastName}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="formEmail" className="mt-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formModel.email}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="formPhoneNum" className="mt-3">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              type="tel"
              name="phoneNum"
              value={formModel.phoneNum}
              onChange={handleChange}
            />
          </Form.Group>

          <Card.Text className="mt-3">Your User Type: {userType}</Card.Text>
          <Card.Text className="mt-3">Your User ID: {session?.user.id}</Card.Text>

          <Button variant="primary" type="submit">
            Save Changes
          </Button>

          <Button variant="danger" type="button" onClick={handleLogout}>
            Logout
          </Button>
        </Form>
      </Card.Body>
    </Card>
  )
}
