'use client'
import { useState } from 'react'
import { useAlerter, useSupabaseClient } from 'livelawyerlibrary/context-manager'
import { validatePassword } from 'livelawyerlibrary/input-validation'
import { ValidatedForm } from 'livelawyerlibrary/forms/validated-form'
import { ValidatedTextField } from 'livelawyerlibrary/forms/validated-text-field'
import { ValidatedFormSubmitButton } from 'livelawyerlibrary/forms/validated-form-submit-button'
import { PageContent } from '@/components/ui/page-content'
import KeyIcon from '@mui/icons-material/Key'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Link from 'next/link'

interface FormModel {
  password: string
  confirmPassword: string
}

export default function ResetPassword() {
  const supabaseRef = useSupabaseClient()
  const alerterRef = useAlerter()
  const [loading, setLoading] = useState<boolean>(false)
  const [reset, setReset] = useState<boolean>(false)

  const [formModel, setFormModel] = useState<FormModel>({
    password: '',
    confirmPassword: '',
  })

  // Triggering the password reset when the form is submitted:
  const handleSubmit = async () => {
    setLoading(true)
    const { error } = await supabaseRef.current.auth.updateUser({
      password: formModel.password,
    })
    if (error) {
      alerterRef.current.error(
        `Something went wrong when trying to reset your password! Try again. (${error.message})`,
      )
    } else {
      setReset(true)
    }
    setLoading(false)
  }

  return (
    <PageContent title="Reset Password" width="xs" alignItems="center">
      {reset ? (
        <>
          <Alert severity="success" variant="filled">
            Your password has been successfully reset!
          </Alert>
          <Button variant="contained" LinkComponent={Link} href="/">
            Proceed to Site
          </Button>
        </>
      ) : (
        <ValidatedForm
          disabled={loading}
          model={formModel}
          setModel={setFormModel}
          onSubmit={handleSubmit}
        >
          <ValidatedTextField
            name="password"
            type="password"
            icon={<KeyIcon />}
            label="Password"
            validator={validatePassword}
            helperText="Passwords must be at least 8 characters long."
            required
          />

          <ValidatedTextField
            name="confirmPassword"
            type="password"
            icon={<KeyIcon />}
            label="Confirm Password"
            validator={() => formModel.password === formModel.confirmPassword}
            helperText="Passwords must match."
            required
          />

          <ValidatedFormSubmitButton>Reset Password</ValidatedFormSubmitButton>
        </ValidatedForm>
      )}
    </PageContent>
  )
}
