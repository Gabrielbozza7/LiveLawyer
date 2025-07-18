import { useAlerter, useSupabaseClient } from 'livelawyerlibrary/context-manager'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { ActivityIndicator, Dialog, FAB, Portal, Text, TextInput } from 'react-native-paper'
import { ErrorBanner } from '../ui/error-banner'
import { StyleSheet, View } from 'react-native'
import { ValidatedForm } from 'livelawyerlibrary/forms/validated-form'
import { ValidatedTextField } from 'livelawyerlibrary/forms/validated-text-field'
import { validateEmail } from 'livelawyerlibrary/input-validation'
import { ValidatedFormSubmitButton } from 'livelawyerlibrary/forms/validated-form-submit-button'
import { newStyles } from '@/constants/Styles'

export default function Sensitive() {
  const alerterRef = useAlerter()
  const supabaseRef = useSupabaseClient()
  const [currentEmail, setCurrentEmail] = useState<string | null | undefined>(undefined)
  const [changeEmailDialogOpen, setChangeEmailDialogOpen] = useState<boolean>(false)

  useEffect(() => {
    if (currentEmail === undefined) {
      ;(async () => {
        const {
          data: { user },
          error,
        } = await supabaseRef.current.auth.getUser()
        if (error || user === null) {
          console.log((error as Error).message)
          setCurrentEmail(null)
        } else {
          setCurrentEmail(user.email ?? 'None')
        }
      })()
    }
  }, [alerterRef, currentEmail, supabaseRef])

  return (
    <>
      {currentEmail === undefined ? (
        <ActivityIndicator />
      ) : currentEmail === null ? (
        <ErrorBanner text="Something went wrong when trying to fetch your account information! Try again later." />
      ) : (
        <View style={styles.aligner}>
          <View>
            <Text variant="headlineSmall">Current Email</Text>
            <Text variant="bodyMedium">{currentEmail}</Text>
          </View>
          <FAB
            label="Change Email"
            uppercase={true}
            onPress={() => setChangeEmailDialogOpen(true)}
            mode="elevated"
            variant="surface"
          />
        </View>
      )}
      <ChangeEmailDialog
        currentEmail={currentEmail ?? ''}
        open={changeEmailDialogOpen}
        setOpen={setChangeEmailDialogOpen}
      />
    </>
  )
}

interface ChangeEmailDialogProps {
  currentEmail: string
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

function ChangeEmailDialog({ currentEmail, open, setOpen }: ChangeEmailDialogProps) {
  const alerterRef = useAlerter()
  const supabaseRef = useSupabaseClient()
  const [formModel, setFormModel] = useState<{ email: string }>({ email: '' })

  const handleSubmit = async () => {
    const { error } = await supabaseRef.current.auth.updateUser({
      email: formModel.email,
    })
    if (error) {
      alerterRef.current.error('Something went wrong when trying to send the confirmation!')
    } else {
      alerterRef.current.success('Confirmation sent!')
    }
    setOpen(false)
  }

  return (
    <Portal>
      <Dialog onDismiss={() => setOpen(false)} visible={open}>
        <Dialog.Title>
          <Text>Change Email</Text>
        </Dialog.Title>
        <Dialog.ScrollArea theme={{ colors: { surfaceVariant: 'transparent' } }}>
          <ValidatedForm model={formModel} setModel={setFormModel} onSubmit={handleSubmit}>
            <ValidatedTextField
              name="email"
              type="email"
              icon={<TextInput.Icon icon="email" style={newStyles.textInputIcon} />}
              label="New Email"
              validator={validateEmail}
              helperText="Email must reflect the structure of a real email address."
              required
            />

            <ValidatedFormSubmitButton disabled={currentEmail === formModel.email} size={12}>
              <Text>Send Confirmation</Text>
            </ValidatedFormSubmitButton>
          </ValidatedForm>
        </Dialog.ScrollArea>
      </Dialog>
    </Portal>
  )
}

const styles = StyleSheet.create({
  aligner: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    flexGrow: 1,
    padding: 24,
  },
})
