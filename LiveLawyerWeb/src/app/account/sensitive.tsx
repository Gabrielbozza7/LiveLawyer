import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useAlerter, useSupabaseClient } from 'livelawyerlibrary/context-manager'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import { ValidatedForm } from 'livelawyerlibrary/forms/validated-form'
import { ValidatedTextField } from 'livelawyerlibrary/forms/validated-text-field'
import EmailIcon from '@mui/icons-material/Email'
import { validateEmail } from 'livelawyerlibrary/input-validation'
import { ValidatedFormSubmitButton } from 'livelawyerlibrary/forms/validated-form-submit-button'
import Container from '@mui/material/Container'
import DialogContent from '@mui/material/DialogContent'

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
        <CircularProgress />
      ) : currentEmail === null ? (
        <Alert severity="error" variant="filled">
          Something went wrong when trying to fetch your account information! Try again later.
        </Alert>
      ) : (
        <Container sx={{ justifyContent: 'center' }}>
          <Container maxWidth="sm" sx={{ alignItems: 'stretch', flexGrow: 1, padding: 0 }}>
            <Grid container columnSpacing={3}>
              <Grid size={6} display="flex" justifyContent="flex-start" alignItems="center">
                <div>
                  <Typography variant="overline">Current Email</Typography>
                  <Typography variant="body1">{currentEmail}</Typography>
                </div>
              </Grid>
              <Grid size={6} display="flex" justifyContent="flex-end" alignItems="center">
                <Button variant="contained" onClick={() => setChangeEmailDialogOpen(true)}>
                  Change Email
                </Button>
              </Grid>
            </Grid>
          </Container>
        </Container>
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
    <Dialog onClose={() => setOpen(false)} open={open}>
      <DialogTitle>Change Email</DialogTitle>
      <DialogContent>
        <ValidatedForm model={formModel} setModel={setFormModel} onSubmit={handleSubmit}>
          <ValidatedTextField
            name="email"
            type="email"
            icon={<EmailIcon />}
            label="New Email"
            validator={validateEmail}
            helperText="Email must reflect the structure of a real email address."
            required
            size={12}
          />

          <ValidatedFormSubmitButton disabled={currentEmail === formModel.email} size={12}>
            Send Confirmation
          </ValidatedFormSubmitButton>
        </ValidatedForm>
      </DialogContent>
    </Dialog>
  )
}
