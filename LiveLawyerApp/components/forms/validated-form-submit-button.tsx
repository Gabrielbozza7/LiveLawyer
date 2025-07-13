import { ReactNode, useContext, useEffect, useState } from 'react'
import {
  FormDisablingContext,
  FormInvalidationsContext,
  FormSubmittingContext,
} from './validated-form'
import { Button } from 'react-native-paper'

interface ValidatedFormSubmitButtonProps {
  disabled?: boolean
  children?: ReactNode
}

export function ValidatedFormSubmitButton({ disabled, children }: ValidatedFormSubmitButtonProps) {
  const disabledContext = useContext(FormDisablingContext)
  const submitContext = useContext(FormSubmittingContext)
  const { invalidations } = useContext(FormInvalidationsContext)

  // This fixes an animation bug.
  const [displayAsDisabled, setDisplayAsDisabled] = useState<boolean>(true)
  useEffect(() => {
    setTimeout(() => setDisplayAsDisabled(false), 10)
  }, [])

  return (
    <Button
      disabled={displayAsDisabled || disabledContext || disabled || invalidations.size > 0}
      mode="elevated"
      onPress={submitContext}
      theme={{
        colors: {
          elevation: {
            level1: 'rgb(105, 239, 109)', // Cards
          },
          surfaceDisabled: 'rgb(193, 193, 193)',
        },
      }}
    >
      {children}
    </Button>
  )
}
