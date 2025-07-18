import { useAlerter, useSession, useSupabaseClient } from 'livelawyerlibrary/context-manager'
import { ValidatedForm } from 'livelawyerlibrary/forms/validated-form'
import { ValidatedFormSubmitButton } from 'livelawyerlibrary/forms/validated-form-submit-button'
import { ValidatedTextField } from 'livelawyerlibrary/forms/validated-text-field'
import { notEmpty, validatePhoneNumber } from 'livelawyerlibrary/input-validation'
import { useCallback, useEffect, useState } from 'react'
import { Text, TextInput } from 'react-native-paper'

interface FormModel {
  firstName: string
  lastName: string
  phoneNumber: string
}

export default function General() {
  const alerterRef = useAlerter()
  const supabaseRef = useSupabaseClient()
  const sessionRef = useSession()
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
        icon={<TextInput.Icon icon="account" />}
        label="First Name"
        defaultValue={prefilledFormModel?.firstName}
        validator={notEmpty}
        helperText="Value must not be empty."
        required
      />

      <ValidatedTextField
        name="lastName"
        type="text"
        icon={<TextInput.Icon icon="account" />}
        label="Last Name"
        defaultValue={prefilledFormModel?.lastName}
        validator={notEmpty}
        helperText="Value must not be empty."
        required
      />

      <ValidatedTextField
        name="phoneNumber"
        type="tel"
        icon={<TextInput.Icon icon="phone" />}
        label="Phone Number"
        defaultValue={prefilledFormModel?.phoneNumber}
        validator={validatePhoneNumber}
        helperText="Type the 10 digits without punctuation (US numbers only)."
        required
      />

      <ValidatedFormSubmitButton
        disabled={JSON.stringify(prefilledFormModel) === JSON.stringify(formModel)}
      >
        <Text>Save Changes</Text>
      </ValidatedFormSubmitButton>
    </ValidatedForm>
  )
}
