import { useEffect, useState } from 'react'
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
import KeyIcon from '@mui/icons-material/Key'
import { validateEmail, validatePassword } from 'livelawyerlibrary/input-validation'
import { ValidatedFormSubmitButton } from 'livelawyerlibrary/forms/validated-form-submit-button'
import Container from '@mui/material/Container'
import DialogContent from '@mui/material/DialogContent'
import Box from '@mui/material/Box'

type PossibleDialog = 'Email' | 'Password' | null

export default function Sensitive() {
  const alerterRef = useAlerter()
  const supabaseRef = useSupabaseClient()
  const [currentEmail, setCurrentEmail] = useState<string | null | undefined>(undefined)
  const [openDialog, setOpenDialog] = useState<PossibleDialog>(null)

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

  const close = () => setOpenDialog(null)

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
          <Container maxWidth="xl" sx={{ alignItems: 'stretch', flexGrow: 1, padding: 0 }}>
            <Grid container columnSpacing={3}>
              <Grid size={6} display="flex" justifyContent="flex-start" alignItems="center">
                <Box>
                  <Typography variant="overline">Current Email</Typography>
                  <Typography variant="body1">{currentEmail}</Typography>
                </Box>
              </Grid>
              <Grid size={6} display="flex" justifyContent="flex-end" alignItems="center">
                <Button variant="contained" onClick={() => setOpenDialog('Email')}>
                  Change Email
                </Button>
              </Grid>
              <Grid size={6} display="flex" justifyContent="flex-start" alignItems="center" />
              <Grid size={6} display="flex" justifyContent="flex-end" alignItems="center">
                <Button variant="contained" onClick={() => setOpenDialog('Password')}>
                  Reset Password
                </Button>
              </Grid>
            </Grid>
          </Container>
        </Container>
      )}
      <ChangeEmailDialog
        currentEmail={currentEmail ?? ''}
        open={openDialog === 'Email'}
        close={close}
      />
      <ResetPasswordDialog open={openDialog === 'Password'} close={close} />
    </>
  )
}

interface DialogProps {
  open: boolean
  close: () => unknown
}

function ChangeEmailDialog({ currentEmail, open, close }: { currentEmail: string } & DialogProps) {
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
    close()
  }

  return (
    <Dialog onClose={close} open={open}>
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
          />

          <ValidatedFormSubmitButton disabled={currentEmail === formModel.email}>
            Send Confirmation
          </ValidatedFormSubmitButton>
        </ValidatedForm>
      </DialogContent>
    </Dialog>
  )
}

function ResetPasswordDialog({ open, close }: DialogProps) {
  const alerterRef = useAlerter()
  const supabaseRef = useSupabaseClient()
  const [formModel, setFormModel] = useState<{ password: string; confirmPassword: string }>({
    password: '',
    confirmPassword: '',
  })

  const handleSubmit = async () => {
    const { error } = await supabaseRef.current.auth.updateUser({
      password: formModel.password,
    })
    if (error) {
      alerterRef.current.error('Something went wrong when trying to reset your password!')
    } else {
      alerterRef.current.success('Password reset successfully!')
    }
    close()
  }

  return (
    <Dialog onClose={close} open={open}>
      <DialogTitle>Reset Password</DialogTitle>
      <DialogContent>
        <ValidatedForm model={formModel} setModel={setFormModel} onSubmit={handleSubmit}>
          <ValidatedTextField
            name="password"
            type="password"
            icon={<KeyIcon />}
            label="New Password"
            validator={validatePassword}
            helperText="Passwords must be at least 8 characters long."
            required
          />

          <ValidatedTextField
            name="confirmPassword"
            type="password"
            icon={<KeyIcon />}
            label="Confirm New Password"
            validator={() => formModel.password === formModel.confirmPassword}
            helperText="Passwords must match."
            required
          />

          <ValidatedFormSubmitButton>Reset Password</ValidatedFormSubmitButton>
        </ValidatedForm>
      </DialogContent>
    </Dialog>
  )
}
