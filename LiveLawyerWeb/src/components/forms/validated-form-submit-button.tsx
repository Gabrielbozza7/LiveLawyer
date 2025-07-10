import Grid from '@mui/material/Grid'
import { ReactNode, useContext, useEffect, useState } from 'react'
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

  // This fixes an animation bug.
  const [displayAsDisabled, setDisplayAsDisabled] = useState<boolean>(true)
  useEffect(() => {
    setTimeout(() => setDisplayAsDisabled(false), 10)
  }, [])

  return (
    <Grid size={size ?? 12}>
      <Button
        fullWidth
        disabled={displayAsDisabled || disabledContext || disabled || invalidations.size > 0}
        variant="contained"
        color={color ?? 'primary'}
        type="submit"
      >
        {children}
      </Button>
    </Grid>
  )
}
