import { FormEvent, useEffect, useState } from 'react'
import { Button, Card, Container, Form, Toast } from 'react-bootstrap'
import { AccountSubFormProps } from './account'
import OfficeSelector, { OfficeOption, OfficeSelection } from './office-selector'
import { PostgrestError } from '@supabase/supabase-js'
import { UserType } from 'livelawyerlibrary'

interface FormModel {
  firstName: string
  lastName: string
  email: string
  phoneNum: string
  officeId?: string
}

export default function Editor({
  setLoading,
  setStatusMessage,
  setActiveForm,
  supabase,
  session,
}: AccountSubFormProps) {
  const [showToast, setShowToast] = useState<string | null>(null)
  const [userType, setUserType] = useState<UserType>('Client')
  const [openChangeOffice, setOpenChangeOffice] = useState<boolean>(false)
  const [currentOffice, setCurrentOffice] = useState<OfficeOption | undefined>()

  const [formModel, setFormModel] = useState<FormModel>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNum: '',
  })
  const [officeSelection, setOfficeSelection] = useState<OfficeSelection | undefined>()

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
          if (data.userType === 'Lawyer') {
            const { data: lawyerData, error: lawyerError } = await supabase
              .from('UserLawyer')
              .select('officeId(id, name)')
              .eq('id', session?.user.id ?? '')
              .single()
            if (lawyerError) {
              setStatusMessage(
                'Something went wrong when trying to fetch your lawyer information! Try again later.',
              )
            }
            if (lawyerData?.officeId) {
              setCurrentOffice({ id: lawyerData.officeId.id, name: lawyerData.officeId.name })
            }
          }
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
    let failed = false
    // Creating law office and updating lawyer profile if specified:
    if (
      officeSelection !== undefined &&
      officeSelection?.selectedOfficeId === undefined &&
      session !== undefined
    ) {
      const { data, error: insertError } = await supabase
        .from('LawOffice')
        .insert({
          administrator: session.user.id,
          name: officeSelection.newOfficeName,
        })
        .select()
        .single()
      let upsertError: PostgrestError | null = null
      if (data !== null) {
        // Updating lawyer profile:
        const { error: upsertInnerError } = await supabase
          .from('UserLawyer')
          .upsert({ id: session.user.id, officeId: data.id }, { onConflict: 'id' })
          .single()
        upsertError = upsertInnerError
        setCurrentOffice({ id: data.id, name: officeSelection.newOfficeName })
      }
      if (insertError || upsertError) {
        failed = true
        setStatusMessage(
          'Something went wrong when trying to create the new office! Try again later.',
        )
      }
    } else if (
      officeSelection !== undefined &&
      officeSelection?.selectedOfficeId !== undefined &&
      session !== undefined
    ) {
      // Updating lawyer profile to existing law office if specified:
      const { error: upsertError } = await supabase
        .from('UserLawyer')
        .upsert(
          { id: session.user.id, officeId: officeSelection.selectedOfficeId },
          { onConflict: 'id' },
        )
        .single()
      setCurrentOffice({
        id: officeSelection.selectedOfficeId,
        name: officeSelection.newOfficeName,
      })
      if (upsertError) {
        failed = true
        setStatusMessage(
          'Something went wrong when trying to add you to the office! Try again later.',
        )
      }
    }
    // Updating profile:
    if (!failed) {
      const { error: updateError } = await supabase
        .from('User')
        .update({
          firstName: formModel.firstName,
          lastName: formModel.lastName,
          email: formModel.email,
          phoneNum: formModel.phoneNum,
        })
        .eq('id', session?.user.id ?? '')
        .single()
      if (updateError) {
        failed = true
        setStatusMessage(
          'Something went wrong when trying to update your account! Try again later.',
        )
      }
    }
    if (!failed) {
      setOpenChangeOffice(false)
      setOfficeSelection(undefined)
      setShowToast('Update successful!')
    }
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

          {userType === 'Lawyer' ? (
            <Container className="mt-3">
              {!openChangeOffice ? (
                <Button variant="primary" type="button" onClick={() => setOpenChangeOffice(true)}>
                  Change Office
                </Button>
              ) : (
                <OfficeSelector
                  currentOffice={currentOffice}
                  setSelection={setOfficeSelection}
                  supabase={supabase}
                />
              )}
            </Container>
          ) : (
            <></>
          )}

          {currentOffice ? (
            <div>
              <Card.Text className="mt-3">Your Office Name: {currentOffice.name}</Card.Text>
              <Card.Text className="mt-3">Your Office ID: {currentOffice.id}</Card.Text>
            </div>
          ) : (
            <></>
          )}
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
