import { FormEvent, useCallback, useEffect, useState } from 'react'
import { Button, Card, Form, Toast } from 'react-bootstrap'
import { AccountSubFormProps } from './account'
import { useSession, useSupabaseClient, useUserType } from 'livelawyerlibrary/context-manager'
import { useRouter } from 'next/navigation'

interface FormModel {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  officeId?: string
}

export default function UserEditor({ loading, setLoading, setStatusMessage }: AccountSubFormProps) {
  const router = useRouter()
  const supabaseRef = useSupabaseClient()
  const sessionRef = useSession()
  const userType = useUserType()
  const [showToast, setShowToast] = useState<string | null>(null)

  // This is currently unused but can be used later by disabling the submit button unless the info has actually
  // changed if the office selection gets moved to a separate component.
  const [prefilledFormModel, setPrefilledFormModel] = useState<FormModel | undefined>(undefined)
  const [formModel, setFormModel] = useState<FormModel>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  })

  const prefillForm = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabaseRef.current
      .from('User')
      .select()
      .eq('id', sessionRef.current.user.id)
      .single()
    if (error || data === null) {
      setStatusMessage(
        'Something went wrong when trying to fetch your account information! Try again later.',
      )
    } else {
      const refreshModel = {
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber ?? '+12223334444',
        email: data.email,
      }
      setPrefilledFormModel(refreshModel)
      setFormModel(refreshModel)
    }
    setLoading(false)
  }, [sessionRef, setLoading, setStatusMessage, supabaseRef])

  // Filling the form with the user's existing data before presenting it for editing:
  useEffect(() => {
    if (prefilledFormModel === undefined) {
      prefillForm()
    }
  }, [prefillForm, prefilledFormModel])

  // Dynamically syncing the form changes to the account model:
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormModel(prev => ({ ...prev, [name]: value }))
  }

  // Phone number format validation:
  const [phoneNumberValid, setPhoneNumberValid] = useState<boolean>(false)
  useEffect(() => {
    setPhoneNumberValid(formModel.phoneNumber.match(/^\+[1-9]\d{1,14}$/) ? true : false)
  }, [formModel.phoneNumber])

  // Updating the database based on the new account model when the form is submitted:
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    // Updating profile:
    const { error: updateError } = await supabaseRef.current
      .from('User')
      .update({
        firstName: formModel.firstName,
        lastName: formModel.lastName,
        email: formModel.email,
        phoneNumber: formModel.phoneNumber,
      })
      .eq('id', sessionRef.current.user.id)
      .single()
    if (updateError) {
      setStatusMessage('Something went wrong when trying to update your account! Try again later.')
    } else {
      setPrefilledFormModel(formModel)
      setShowToast('Update successful!')
    }
    setLoading(false)
  }

  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    setLoading(true)
    try {
      await supabaseRef.current.auth.signOut()
      router.push('/')
    } catch {
      setStatusMessage('Something went wrong when trying to log out! Try again later.')
    } finally {
      setLoading(false)
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
              disabled={loading}
              type="text"
              name="firstName"
              value={formModel.firstName}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="formLastName" className="mt-3">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              disabled={loading}
              type="text"
              name="lastName"
              value={formModel.lastName}
              onChange={handleChange}
            />
          </Form.Group>

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

          <Form.Group controlId="formPhoneNumber" className="mt-3">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              disabled={loading}
              type="tel"
              name="phoneNumber"
              value={formModel.phoneNumber}
              onChange={handleChange}
            />
          </Form.Group>

          <Card.Text className="mt-3">
            Phone number must conform to E.164 format: {phoneNumberValid ? '✔️' : '❌'}
          </Card.Text>

          <Card.Text className="mt-3">Your User Type: {userType}</Card.Text>
          <Card.Text className="mt-3">Your User ID: {sessionRef.current.user.id}</Card.Text>

          <Button
            disabled={
              loading ||
              !phoneNumberValid ||
              JSON.stringify(prefilledFormModel) === JSON.stringify(formModel)
            }
            variant="primary"
            type="submit"
            className="mt-3"
          >
            Save Changes
          </Button>

          <Button disabled={loading} variant="danger" onClick={handleLogout} className="mt-3">
            Logout
          </Button>
        </Form>
      </Card.Body>
      <Toast
        bg="primary"
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
