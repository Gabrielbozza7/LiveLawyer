import { ReactNode, useContext, useEffect, useState } from 'react'
import {
  FormDisablingContext,
  FormInvalidationsContext,
  FormSubmittingContext,
} from './validated-form'
import { usePlatformValidatedFormComponents } from '../context-manager'
import React from 'react'

export interface ValidatedFormSubmitButtonProps {
  disabled?: boolean
  size?: number
  children?: ReactNode
}

export type PlatformValidatedFormSubmitButtonProps = ValidatedFormSubmitButtonProps & {
  displayAsDisabled: boolean
  submit: () => void
}

export function ValidatedFormSubmitButton({
  disabled,
  size,
  children,
}: ValidatedFormSubmitButtonProps) {
  const { FormSubmitButton } = usePlatformValidatedFormComponents()
  const disabledContext = useContext(FormDisablingContext)
  const submitContext = useContext(FormSubmittingContext)
  const { invalidations } = useContext(FormInvalidationsContext)

  // This fixes an animation bug.
  const [initialDisplayAsDisabled, setInitialDisplayAsDisabled] = useState<boolean>(true)
  useEffect(() => {
    setTimeout(() => setInitialDisplayAsDisabled(false), 10)
  }, [])

  const displayAsDisabled =
    initialDisplayAsDisabled || disabledContext || disabled || invalidations.size > 0

  return (
    <FormSubmitButton
      disabled={disabled}
      size={size}
      children={children}
      displayAsDisabled={displayAsDisabled}
      submit={submitContext}
    />
  )
}
