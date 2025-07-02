import { FormEvent, useEffect, useState } from 'react'
import { Button, Card, Form, Toast } from 'react-bootstrap'
import { AccountOfficeSubFormProps, AccountSubFormProps } from './account'
import { useSession, useSupabaseClient } from 'livelawyerlibrary/context-manager'

interface FormModel {
  name: string
  email: string
  phoneNumber: string
  websiteUrl: string
  address: string
}

export default function OfficeEditor({
  loading,
  setLoading,
  setStatusMessage,
  currentOffice,
  setCurrentOffice,
}: AccountSubFormProps & AccountOfficeSubFormProps) {
  const supabaseRef = useSupabaseClient()
  const sessionRef = useSession()
  const [showToast, setShowToast] = useState<string | null>(null)

  const [prefilledFormModel, setPrefilledFormModel] = useState<FormModel | undefined>(undefined)
  const [canEdit, setCanEdit] = useState<boolean>(false)
  const [formModel, setFormModel] = useState<FormModel>({
    name: '',
    email: '',
    phoneNumber: '',
    websiteUrl: '',
    address: '',
  })

  // Filling the form with the user's existing data before presenting it for editing:
  useEffect(() => {
    if (currentOffice === null || currentOffice === undefined) return
    const refreshModel = {
      name: currentOffice.name,
      email: currentOffice.email ?? '',
      phoneNumber: currentOffice.phoneNumber ?? '',
      websiteUrl: currentOffice.websiteUrl ?? '',
      address: currentOffice.address ?? '',
    }
    setPrefilledFormModel(refreshModel)
    setFormModel(refreshModel)
    setCanEdit(currentOffice.administratorId === sessionRef.current.user.id)
  }, [currentOffice, sessionRef])

  // Dynamically syncing the form changes to the account model:
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormModel(prev => ({ ...prev, [name]: value }))
  }

  // Phone number format validation:
  const [phoneNumberValid, setPhoneNumberValid] = useState<boolean>(false)
  useEffect(() => {
    setPhoneNumberValid(
      formModel.phoneNumber === '' || formModel.phoneNumber.match(/^\+[1-9]\d{1,14}$/)
        ? true
        : false,
    )
  }, [formModel.phoneNumber])

  // Updating the database based on the new office model when the form is submitted:
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (currentOffice === null || currentOffice === undefined) return
    setLoading(true)
    // Updating law office:
    const { error: updateError } = await supabaseRef.current
      .from('LawOffice')
      .update({
        name: formModel.name,
        email: formModel.email === '' ? null : formModel.email,
        phoneNumber: formModel.phoneNumber === '' ? null : formModel.phoneNumber,
        websiteUrl: formModel.websiteUrl === '' ? null : formModel.websiteUrl,
        address: formModel.address === '' ? null : formModel.address,
      })
      .eq('id', currentOffice.id)
      .single()
    if (updateError) {
      setStatusMessage('Something went wrong when trying to update your account! Try again later.')
    } else {
      setPrefilledFormModel(formModel)
      setShowToast('Update successful!')
    }
    setLoading(false)
  }

  const handleLeave = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    setLoading(true)
    try {
      await supabaseRef.current
        .from('UserLawyer')
        .update({ officeId: null })
        .eq('id', sessionRef.current.user.id)
    } catch {
      setStatusMessage('Something went wrong when trying to leave the office! Try again later.')
    } finally {
      setLoading(false)
    }
    setCurrentOffice(null)
  }

  return (
    <Card>
      <Card.Body>
        <h4 className="mb-4">Office Information</h4>
        <Form onSubmit={handleSubmit}>
          {!canEdit && (
            <Card.Text>
              You cannot edit this office because you are not its administrator.
            </Card.Text>
          )}

          <Form.Group controlId="formName" className="mt-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              disabled={loading || !canEdit}
              type="text"
              name="name"
              value={formModel.name}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="formEmail" className="mt-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              disabled={loading || !canEdit}
              type="email"
              name="email"
              value={formModel.email}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="formPhoneNumber" className="mt-3">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              disabled={loading || !canEdit}
              type="tel"
              name="phoneNumber"
              value={formModel.phoneNumber}
              onChange={handleChange}
            />
          </Form.Group>

          <Card.Text className="mt-3">
            Phone number must be blank or conform to E.164 format: {phoneNumberValid ? '✔️' : '❌'}
          </Card.Text>

          <Form.Group controlId="formWebsiteUrl" className="mt-3">
            <Form.Label>Website URL</Form.Label>
            <Form.Control
              disabled={loading || !canEdit}
              type="text"
              name="websiteUrl"
              value={formModel.websiteUrl}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="formAddress" className="mt-3">
            <Form.Label>Address</Form.Label>
            <Form.Control
              disabled={loading || !canEdit}
              type="text"
              name="address"
              value={formModel.address}
              onChange={handleChange}
            />
          </Form.Group>

          {currentOffice && (
            <>
              <Card.Text className="mt-3">Your Office Name: {currentOffice.name}</Card.Text>
              <Card.Text className="mt-3">Your Office ID: {currentOffice.id}</Card.Text>
            </>
          )}

          <Button
            disabled={
              loading ||
              !phoneNumberValid ||
              JSON.stringify(prefilledFormModel) === JSON.stringify(formModel)
            }
            variant="primary"
            type="submit"
          >
            Save Changes
          </Button>

          <Button disabled={loading} variant="danger" type="button" onClick={handleLeave}>
            Leave Office
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
