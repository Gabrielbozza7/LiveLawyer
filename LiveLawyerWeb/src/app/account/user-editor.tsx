import { useCallback, useEffect, useState } from 'react'
import { AccountSubFormProps } from './account'
import { useSession, useSupabaseClient, useUserType } from 'livelawyerlibrary/context-manager'
import { useRouter } from 'next/navigation'
import { ValidatedForm } from '@/components/forms/validated-form'
import { ValidatedTextField } from '@/components/forms/validated-text-field'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import { notEmpty, validateEmail, validatePhoneNumber } from 'livelawyerlibrary/input-validation'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import { ValidatedFormSubmitButton } from '@/components/forms/validated-form-submit-button'
import Grid from '@mui/material/Grid'
import { Toast } from 'react-bootstrap'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

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

  // Updating the database based on the new account model when the form is submitted:
  const handleSubmit = async () => {
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
    <>
      <Typography variant="overline">Account Information</Typography>
      <ValidatedForm
        disabled={loading}
        model={formModel}
        setModel={setFormModel}
        onSubmit={handleSubmit}
      >
        <ValidatedTextField
          name="firstName"
          type="text"
          icon={<PersonOutlineIcon />}
          label="First Name"
          defaultValue={prefilledFormModel?.firstName}
          validator={notEmpty}
          helperText="Value must not be empty."
          required
          size={6}
        />

        <ValidatedTextField
          name="lastName"
          type="text"
          icon={<PersonOutlineIcon />}
          label="Last Name"
          defaultValue={prefilledFormModel?.lastName}
          validator={notEmpty}
          helperText="Value must not be empty."
          required
          size={6}
        />

        <ValidatedTextField
          name="email"
          type="email"
          icon={<EmailIcon />}
          label="Email"
          defaultValue={prefilledFormModel?.email}
          validator={validateEmail}
          helperText="Email must reflect the structure of a real email address."
          required
          size={6}
        />

        <ValidatedTextField
          name="phoneNumber"
          type="tel"
          icon={<PhoneIcon />}
          label="Phone Number"
          defaultValue={prefilledFormModel?.phoneNumber}
          validator={validatePhoneNumber}
          helperText="Phone number must conform to E.164 format"
          required
          size={6}
        />

        <Grid size={12}>
          <Typography variant="body1">
            Your User Type: {userType}
            <br /> <br />
            Your User ID: {sessionRef.current.user.id}
          </Typography>
        </Grid>

        <ValidatedFormSubmitButton
          disabled={JSON.stringify(prefilledFormModel) === JSON.stringify(formModel)}
          color="success"
          size={6}
        >
          Save Changes
        </ValidatedFormSubmitButton>
        <Grid size={6}>
          <Button
            fullWidth
            disabled={loading}
            variant="contained"
            color="error"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Grid>
      </ValidatedForm>
      <Toast
        bg="primary"
        onClose={() => setShowToast(null)}
        show={showToast !== null}
        delay={2500}
        autohide
      >
        <Toast.Body>{showToast}</Toast.Body>
      </Toast>
    </>
  )
}
