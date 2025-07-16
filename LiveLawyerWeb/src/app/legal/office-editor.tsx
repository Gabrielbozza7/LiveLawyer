import { useEffect, useState } from 'react'
import { useAlerter, useSession, useSupabaseClient } from 'livelawyerlibrary/context-manager'
import { OfficeSubFormProps } from './office-menu'
import Typography from '@mui/material/Typography'
import BusinessIcon from '@mui/icons-material/Business'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import PublicIcon from '@mui/icons-material/Public'
import HomeIcon from '@mui/icons-material/Home'
import { notEmpty, validateEmail, validatePhoneNumber } from 'livelawyerlibrary/input-validation'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import { ValidatedForm } from 'livelawyerlibrary/forms/validated-form'
import { ValidatedTextField } from 'livelawyerlibrary/forms/validated-text-field'
import { ValidatedFormSubmitButton } from 'livelawyerlibrary/forms/validated-form-submit-button'

interface FormModel {
  name: string
  email: string
  phoneNumber: string
  websiteUrl: string
  address: string
}

export default function OfficeEditor({ currentOffice, setCurrentOffice }: OfficeSubFormProps) {
  const alerterRef = useAlerter()
  const supabaseRef = useSupabaseClient()
  const sessionRef = useSession()
  const [loading, setLoading] = useState<boolean>(false)

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
    setFormModel({ ...refreshModel })
    setCanEdit(currentOffice.administratorId === sessionRef.current.user.id)
  }, [currentOffice, sessionRef])

  // Updating the database based on the new office model when the form is submitted:
  const handleSubmit = async () => {
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
      alerterRef.current.error(
        'Something went wrong when trying to update your account! Try again later.',
      )
    } else {
      setPrefilledFormModel(formModel)
      alerterRef.current.success('Update successful!')
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
      setCurrentOffice(null)
    } catch {
      alerterRef.current.error(
        'Something went wrong when trying to leave the office! Try again later.',
      )
    }
    setLoading(false)
  }

  return (
    <>
      {!canEdit && (
        <Typography variant="body1">
          You cannot edit this office because you are not its administrator.
        </Typography>
      )}

      <ValidatedForm
        disabled={loading || !canEdit}
        model={formModel}
        setModel={setFormModel}
        onSubmit={handleSubmit}
      >
        <ValidatedTextField
          name="name"
          type="text"
          icon={<BusinessIcon />}
          label="Name"
          defaultValue={prefilledFormModel?.name}
          validator={notEmpty}
          helperText="Value must not be empty."
          required
        />

        <ValidatedTextField
          name="email"
          type="email"
          icon={<EmailIcon />}
          label="Email"
          defaultValue={prefilledFormModel?.email}
          validator={validateEmail}
          helperText="Email must reflect the structure of a real email address."
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
          size={6}
        />

        <ValidatedTextField
          name="websiteUrl"
          type="text"
          icon={<PublicIcon />}
          label="Website URL"
          defaultValue={prefilledFormModel?.websiteUrl}
        />

        <ValidatedTextField
          name="address"
          type="text"
          icon={<HomeIcon />}
          label="Address"
          defaultValue={prefilledFormModel?.address}
        />

        <Grid size={12}>
          <Typography variant="overline">Current Office Name</Typography>
          <Typography variant="body1">{currentOffice?.name ?? '...'}</Typography>
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
            onClick={handleLeave}
          >
            Leave Office
          </Button>
        </Grid>
      </ValidatedForm>
    </>
  )
}
