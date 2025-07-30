import { useEffect, useMemo, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAlerter, useApi } from 'livelawyerlibrary/context-manager'
import { StandalonePage } from '@/components/ui/standalone-page'
import { Banner, Text, TextInput } from 'react-native-paper'
import { notEmpty, validatePhoneNumber } from 'livelawyerlibrary/input-validation'
import { newStyles } from '@/constants/Styles'
import { FabWithConfirmation } from '@/components/ui/fab-with-confirmation'
import { ValidatedForm } from 'livelawyerlibrary/forms/validated-form'
import { ValidatedTextField } from 'livelawyerlibrary/forms/validated-text-field'
import { ValidatedFormSubmitButton } from 'livelawyerlibrary/forms/validated-form-submit-button'
import { ContactSingle } from 'livelawyerlibrary/api/types/contacts'

interface FormModel {
  name: string
  phoneNumber: string
}

export default function EditContact() {
  const alerterRef = useAlerter()
  const apiRef = useApi()
  const router = useRouter()
  const { data }: { data: string | undefined } = useLocalSearchParams() as {
    data: string | undefined
  }
  const existingContact: ContactSingle | undefined = useMemo(
    () => (data ? JSON.parse(decodeURIComponent(data)) : undefined),
    [data],
  )
  const [loading, setLoading] = useState<boolean>(false)

  const [prefilledFormModel, setPrefilledFormModel] = useState<FormModel | undefined>(undefined)
  const [formModel, setFormModel] = useState<FormModel>({
    name: '',
    phoneNumber: '',
  })

  useEffect(() => {
    if (existingContact !== undefined) {
      const model: FormModel = {
        name: existingContact.name,
        phoneNumber: existingContact.phoneNumber,
      }
      setPrefilledFormModel(model)
      setFormModel({ ...model })
    } else {
      setPrefilledFormModel({ ...formModel })
    }
  }, [data])

  const handleSave = async (_: FormModel, deleting: boolean = false) => {
    setLoading(true)
    try {
      const { action } = await apiRef.current.modifyContact(
        formModel.phoneNumber,
        deleting ? null : formModel.name,
      )
      const messageMap: { [K in typeof action]: string } = {
        CREATED: 'created',
        NAME_UPDATED: 'name updated',
        DELETED: 'deleted',
      }
      alerterRef.current.success(`Contact ${messageMap[action]} successfully!`)
    } catch (error) {
      console.error(error)
      alerterRef.current.error(
        `There was an error when trying to modify your contacts! Try again later.`,
      )
    }
    setLoading(false)
    router.back()
    router.replace('/(tabs)/contacts?refresh=true')
  }

  const handleDelete = () => {
    handleSave(formModel, true)
  }

  return (
    <StandalonePage title={existingContact === undefined ? 'New Contact' : 'Edit Contact'}>
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
          helperText="Type the 10 digits without punctuation (US numbers only)."
          required
        />
        <ValidatedFormSubmitButton
          disabled={JSON.stringify(prefilledFormModel) === JSON.stringify(formModel)}
        >
          <Text>Save</Text>
        </ValidatedFormSubmitButton>
      </ValidatedForm>
      {existingContact !== undefined && (
        <FabWithConfirmation
          disabled={loading}
          icon="delete"
          prompt="Delete?"
          onConfirm={handleDelete}
          animateFrom="right"
          style={newStyles.bottomRightFab}
        />
      )}
      {existingContact && (
        <>
          {existingContact.consentStatus === 'Pending' ? (
            <Banner
              visible={true}
              icon="alert-circle"
              elevation={2}
              theme={{ colors: { elevation: { level2: 'rgb(253, 253, 181)' } } }}
              style={newStyles.spacedCard}
            >
              <Text variant="bodyMedium">
                This contact has not granted or denied consent to be notified by us yet. You can
                tell them to text "ACCEPT {existingContact.nonce}" to the number that prompted them
                in order to grant consent.
              </Text>
            </Banner>
          ) : existingContact.consentStatus === 'Accepted' ? (
            <Banner
              visible={true}
              icon="message-check"
              elevation={2}
              theme={{ colors: { elevation: { level2: 'rgba(142, 227, 138, 1)' } } }}
              style={newStyles.spacedCard}
            >
              <Text variant="bodyMedium">
                This contact has granted consent to receive notifications.
              </Text>
            </Banner>
          ) : (
            <Banner
              visible={true}
              icon="message-off"
              elevation={2}
              theme={{ colors: { elevation: { level2: 'rgb(255, 175, 175)' } } }}
              style={newStyles.spacedCard}
            >
              <Text variant="bodyMedium">
                This contact has denied consent to receive notifications and won't be notified when
                you place a call for legal counsel.
              </Text>
            </Banner>
          )}
        </>
      )}
    </StandalonePage>
  )
}
