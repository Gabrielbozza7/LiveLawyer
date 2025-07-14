'use client'
import { useAlerter, useSession, useSupabaseClient } from 'livelawyerlibrary/context-manager'
import { useState } from 'react'
import { ValidatedForm } from '../forms/validated-form'
import { ValidatedTextField } from '../forms/validated-text-field'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import PhoneIcon from '@mui/icons-material/Phone'
import BadgeIcon from '@mui/icons-material/Badge'
import { notEmpty, validatePhoneNumber } from 'livelawyerlibrary/input-validation'
import { ValidatedFormSubmitButton } from '../forms/validated-form-submit-button'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import ValidatedAutocompleteDropdown, {
  AutocompleteOptionNotNew,
} from '../forms/validated-autocomplete-dropdown'
import { UserType } from 'livelawyerlibrary'
import { PageContent } from '../ui/page-content'
import Container from '@mui/material/Container'
import Image from 'next/image'
import logo from '@/assets/images/live-lawyer-logo.jpeg'
import { ValidatedPhoneNumber } from '../forms/validated-phone-number'

interface UserTypeOptionExtra {
  userType: UserType
}

const USER_TYPE_OPTIONS: AutocompleteOptionNotNew<UserTypeOptionExtra>[] = [
  { label: 'Observer', isNew: false, extra: { userType: 'Observer' } },
  { label: 'Lawyer', isNew: false, extra: { userType: 'Lawyer' } },
] as const

interface FormModel {
  firstName: string
  lastName: string
  phoneNumber: string
  userType: AutocompleteOptionNotNew<UserTypeOptionExtra>
}

export default function CompleteRegistration() {
  const alerterRef = useAlerter()
  const supabaseRef = useSupabaseClient()
  const sessionRef = useSession()
  const [loading, setLoading] = useState<boolean>(false)

  const [formModel, setFormModel] = useState<FormModel>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    userType: USER_TYPE_OPTIONS[0],
  })

  // Making changes based on the new account model when the form is submitted:
  const handleSubmit = async () => {
    setLoading(true)
    const { error: updateError } = await supabaseRef.current
      .from('User')
      .update({
        firstName: formModel.firstName,
        lastName: formModel.lastName,
        phoneNumber: formModel.phoneNumber,
        userType: formModel.userType.extra.userType,
      })
      .eq('id', sessionRef.current.user.id)
      .single()
    if (updateError) {
      alerterRef.current.error(`Something went wrong when trying to update your info! Try again.`)
      setLoading(false)
      return
    }
    const {
      data: { session: newSession },
      error: sessionError,
    } = await supabaseRef.current.auth.refreshSession()
    if (sessionError || newSession === null) {
      alerterRef.current.error(
        'Something went wrong when trying to retrieve your info! Try logging out and logging back in.',
      )
      return
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    setLoading(true)
    try {
      await supabaseRef.current.auth.signOut()
    } catch {
      alerterRef.current.error('Something went wrong when trying to log out! Try again later.')
    }
    setLoading(false)
  }

  return (
    <>
      <title>Complete Registration</title>
      <Container maxWidth="xs" sx={{ marginTop: 3 }}>
        <Image
          style={{
            display: 'flex',
            justifySelf: 'center',
            height: '70%',
            width: '70%',
          }}
          alt="Live Lawyer logo"
          src={logo}
        />
      </Container>
      <PageContent title="Complete New Account Registration" width="xs">
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
            validator={notEmpty}
            helperText="Value must not be empty."
            required
          />

          <ValidatedTextField
            name="lastName"
            type="text"
            icon={<PersonOutlineIcon />}
            label="Last Name"
            validator={notEmpty}
            helperText="Value must not be empty."
            required
          />

          <ValidatedPhoneNumber
            name="phoneNumber"
            icon={<PhoneIcon />}
            label="Phone Number"
            validator={validatePhoneNumber}
            helperText="Type the 10 digits without punctuation (US numbers only)."
            required
          />

          <ValidatedAutocompleteDropdown
            name="userType"
            icon={<BadgeIcon />}
            label="User Type"
            options={USER_TYPE_OPTIONS}
            canAddNew={false}
            defaultValue={USER_TYPE_OPTIONS[0]}
            validator={notEmpty}
            helperText="Select an option."
            required
          />

          <ValidatedFormSubmitButton color="success">Confirm</ValidatedFormSubmitButton>
          <Grid size={12}>
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
      </PageContent>
    </>
  )
}
