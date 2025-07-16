'use client'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import { PlatformValidatedFormSubmitButtonProps } from 'livelawyerlibrary/forms/validated-form-submit-button'
import { ReactNode } from 'react'

export function PlatformValidatedFormSubmitButton({
  size,
  children,
  displayAsDisabled,
}: PlatformValidatedFormSubmitButtonProps) {
  return (
    <Grid size={size ?? 12}>
      <Button
        fullWidth
        disabled={displayAsDisabled}
        variant="contained"
        color="success"
        type="submit"
      >
        {children as ReactNode}
      </Button>
    </Grid>
  )
}
