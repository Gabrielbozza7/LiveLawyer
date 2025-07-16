import { useCallback, useEffect, useState } from 'react'
import {
  useAlerter,
  useSession,
  useSupabaseClient,
  useUserType,
} from 'livelawyerlibrary/context-manager'
import { useRouter } from 'next/navigation'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import { notEmpty, validatePhoneNumber } from 'livelawyerlibrary/input-validation'
import PhoneIcon from '@mui/icons-material/Phone'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { ValidatedForm } from 'livelawyerlibrary/forms/validated-form'
import { ValidatedTextField } from 'livelawyerlibrary/forms/validated-text-field'
import { ValidatedFormSubmitButton } from 'livelawyerlibrary/forms/validated-form-submit-button'

interface FormModel {
  firstName: string
  lastName: string
  phoneNumber: string
}

export default function General() {
  const router = useRouter()
  const alerterRef = useAlerter()
  const supabaseRef = useSupabaseClient()
  const sessionRef = useSession()
  const userType = useUserType()
  const [loading, setLoading] = useState<boolean>(true)

  const [prefilledFormModel, setPrefilledFormModel] = useState<FormModel | undefined>(undefined)
  const [formModel, setFormModel] = useState<FormModel>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
  })

  const prefillForm = useCallback(async () => {
    const { data, error } = await supabaseRef.current
      .from('User')
      .select('firstName, lastName, phoneNumber')
      .eq('id', sessionRef.current.user.id)
      .single()
    if (error || data === null) {
      alerterRef.current.error(
        "Something went wrong when trying to fetch your account information, so the form couldn't be prefilled!",
      )
      setPrefilledFormModel(undefined)
    } else {
      const model = {
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber ?? '',
      }
      setPrefilledFormModel(model)
      setFormModel({ ...model })
    }
    setLoading(false)
  }, [alerterRef, sessionRef, supabaseRef])

  // Filling the form with the user's existing data before presenting it for editing:
  useEffect(() => {
    prefillForm()
  }, [prefillForm])

  // Updating the database based on the new account model when the form is submitted:
  const handleSubmit = async () => {
    setLoading(true)
    // Updating profile:
    const { error } = await supabaseRef.current
      .from('User')
      .update({
        firstName: formModel.firstName,
        lastName: formModel.lastName,
        phoneNumber: formModel.phoneNumber,
      })
      .eq('id', sessionRef.current.user.id)
      .single()
    if (error) {
      alerterRef.current.error(
        'Something went wrong when trying to update your account! Try again later.',
      )
    } else {
      setPrefilledFormModel(formModel)
      alerterRef.current.success('Update successful!')
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
      alerterRef.current.error('Something went wrong when trying to log out! Try again later.')
    }
    setLoading(false)
  }

  return (
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
        name="phoneNumber"
        type="tel"
        icon={<PhoneIcon />}
        label="Phone Number"
        defaultValue={prefilledFormModel?.phoneNumber}
        validator={validatePhoneNumber}
        helperText="Type the 10 digits without punctuation (US numbers only)."
        required
        size={12}
      />

      <Grid size={12}>
        <Typography variant="overline">Your User Type</Typography>
        <Typography variant="body1">{userType}</Typography>
      </Grid>

      <ValidatedFormSubmitButton
        disabled={JSON.stringify(prefilledFormModel) === JSON.stringify(formModel)}
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
  )
}
