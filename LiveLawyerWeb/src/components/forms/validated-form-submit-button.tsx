import Grid from '@mui/material/Grid'
import { ReactNode, useContext } from 'react'
import { FormDisablingContext, FormInvalidationsContext } from './validated-form'
import Button from '@mui/material/Button'

interface ValidatedFormSubmitButtonProps {
  disabled?: boolean
  color?: 'success' | 'inherit' | 'primary' | 'secondary' | 'error' | 'info' | 'warning'
  size?: number
  children?: ReactNode
}

export function ValidatedFormSubmitButton({
  disabled,
  color,
  size,
  children,
}: ValidatedFormSubmitButtonProps) {
  const disabledContext = useContext(FormDisablingContext)
  const { invalidations } = useContext(FormInvalidationsContext)

  return (
    <Grid size={size ?? 12}>
      <Button
        fullWidth
        disabled={disabledContext || disabled || invalidations.size > 0}
        variant="contained"
        color={color ?? 'primary'}
        type="submit"
      >
        {children}
      </Button>
    </Grid>
  )
}
