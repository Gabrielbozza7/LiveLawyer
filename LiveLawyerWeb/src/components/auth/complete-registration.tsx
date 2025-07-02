'use client'
import { useSession, useSupabaseClient } from 'livelawyerlibrary/context-manager'
import { FormEvent, useState } from 'react'
import { Button, Card, Container, Form, Toast } from 'react-bootstrap'

interface FormModel {
  firstName: string
  lastName: string
  phoneNumber: string
  userType: 'Observer' | 'Lawyer'
}

export default function CompleteRegistration() {
  const supabaseRef = useSupabaseClient()
  const sessionRef = useSession()
  const [loading, setLoading] = useState<boolean>(false)
  const [showToast, setShowToast] = useState<string | null>(null)
  const [phoneNumberValid, setPhoneNumberValid] = useState<boolean>(false)

  const [formModel, setFormModel] = useState<FormModel>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    userType: 'Observer',
  })

  // Dynamically syncing the form changes to the account model:
  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormModel(prev => ({ ...prev, [name]: value }))
    if (name === 'phoneNumber') {
      setPhoneNumberValid(value.match(/^\+[1-9]\d{1,14}$/) ? true : false)
    }
  }

  // Dynamically syncing the form changes to the account model:
  const handleChangeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormModel(prev => ({ ...prev, [name]: value }))
  }

  // Making changes based on the new account model when the form is submitted:
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const { error: updateError } = await supabaseRef.current
      .from('User')
      .update({
        firstName: formModel.firstName,
        lastName: formModel.lastName,
        phoneNumber: formModel.phoneNumber,
        userType: formModel.userType,
      })
      .eq('id', sessionRef.current.user.id)
      .single()
    if (updateError) {
      setShowToast(`Something went wrong when trying to update your info! Try again.`)
      setLoading(false)
      return
    }
    const {
      data: { session: newSession },
      error: sessionError,
    } = await supabaseRef.current.auth.refreshSession()
    if (sessionError || newSession === null) {
      setShowToast(
        'Something went wrong when trying to retrieve your info! Try logging out and logging back in.',
      )
      return
    }
    setLoading(false)
  }

  return (
    <>
      <title>Complete Registration</title>
      <Container fluid="md" style={{ margin: 24 }}>
        <Card>
          <Card.Header>Complete New Account Registration</Card.Header>
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
                Phone number must conform to E.164 format: {phoneNumberValid ? '✔️' : '❌'}
              </Card.Text>

              <Button
                disabled={loading || !phoneNumberValid}
                variant="primary"
                type="submit"
                className="mt-3"
              >
                Confirm
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
