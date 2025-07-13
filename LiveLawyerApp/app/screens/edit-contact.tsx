import { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAlerter, useSupabaseClient } from 'livelawyerlibrary/context-manager'
import { StandalonePage } from '@/components/ui/standalone-page'
import { FAB, Text, TextInput } from 'react-native-paper'
import { ValidatedForm } from '@/components/forms/validated-form'
import { ValidatedTextField } from '@/components/forms/validated-text-field'
import { ValidatedFormSubmitButton } from '@/components/forms/validated-form-submit-button'
import { notEmpty, validatePhoneNumber } from 'livelawyerlibrary/input-validation'
import { newStyles } from '@/constants/Styles'

interface FormModel {
  name: string
  phoneNumber: string
}

export default function EditContact() {
  const alerterRef = useAlerter()
  const supabaseRef = useSupabaseClient()
  const router = useRouter()
  const { id }: { id: string | undefined } = useLocalSearchParams() as { id: string | undefined }
  const [loading, setLoading] = useState<boolean>(true)

  const [prefilledFormModel, setPrefilledFormModel] = useState<FormModel | undefined>(undefined)
  const [formModel, setFormModel] = useState<FormModel>({
    name: '',
    phoneNumber: '',
  })

  useEffect(() => {
    ;(async () => {
      if (id !== undefined) {
        const { data: contact, error } = await supabaseRef.current
          .from('Contact')
          .select('name, phoneNumber')
          .eq('id', id)
          .single()
        if (error || contact === null) {
          alerterRef.current.error(
            'There was an error when trying to fetch contact info! Try again later.',
          )
          router.back()
          return
        }
        setPrefilledFormModel(contact)
        setFormModel({ ...contact })
      } else {
        setPrefilledFormModel({ ...formModel })
      }
      setLoading(false)
    })()
  }, [id])

  const handleSave = async () => {
    setLoading(true)
    const { error } = await supabaseRef.current.from('Contact').upsert({ ...formModel, id })
    setLoading(false)
    const actionType = id === undefined ? 'create' : 'update'
    if (error) {
      alerterRef.current.error(
        `There was an error when trying to ${actionType} your contacts! Try again later.`,
      )
    } else {
      alerterRef.current.success(`Contact ${actionType}d successfully!`)
    }
    router.back()
  }

  const handleDelete = async () => {
    if (id === undefined) return
    setLoading(true)
    const { error } = await supabaseRef.current.from('Contact').delete().eq('id', id)
    setLoading(false)

    if (error) {
      alerterRef.current.error(
        'There was an error when trying to delete the contact! Try again later.',
      )
    } else {
      alerterRef.current.success('Contact deleted!')
    }
    router.back()
  }

  return (
    <StandalonePage title={id === undefined ? 'New Contact' : 'Edit Contact'}>
      <ValidatedForm
        disabled={loading}
        model={formModel}
        setModel={setFormModel}
        onSubmit={handleSave}
      >
        <ValidatedTextField
          name="name"
          type="text"
          icon={<TextInput.Icon icon="account" />}
          label="Name"
          defaultValue={prefilledFormModel?.name}
          validator={notEmpty}
          helperText="Value must not be empty."
          required
        />
        <ValidatedTextField
          name="phoneNumber"
          type="tel"
          icon={<TextInput.Icon icon="phone" />}
          label="Phone Number"
          defaultValue={prefilledFormModel?.phoneNumber ?? '+1'}
          validator={validatePhoneNumber}
          helperText="Phone number must conform to E.164 format."
          required
        />
        <ValidatedFormSubmitButton
          disabled={JSON.stringify(prefilledFormModel) === JSON.stringify(formModel)}
        >
          <Text>Save</Text>
        </ValidatedFormSubmitButton>
      </ValidatedForm>
      {id !== undefined && (
        <FAB icon="delete" onPress={handleDelete} style={newStyles.bottomLeftFab} />
      )}
    </StandalonePage>
  )
}
