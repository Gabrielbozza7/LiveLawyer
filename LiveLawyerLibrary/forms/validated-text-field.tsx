import { ReactNode, useContext, useEffect, useState } from 'react'
import { FormDisablingContext, FormInvalidationsContext, FormModelContext } from './validated-form'
import { usePlatformValidatedFormComponents } from '../context-manager'
import React from 'react'
import parsePhoneNumberFromString from 'libphonenumber-js'

export interface ValidatedTextFieldProps {
  name: string
  type: string
  icon?: ReactNode
  label: string
  defaultValue?: string
  validator?: (value: string) => boolean
  helperText?: string
  required?: boolean
  size?: number
}

export type PlatformValidatedTextFieldProps = ValidatedTextFieldProps & {
  disabled: boolean
  error: boolean
  showHelperText: boolean
  value: string
  onChange: (newValue: string) => unknown
}

export function ValidatedTextField({
  name,
  type,
  icon,
  label,
  defaultValue,
  validator,
  helperText,
  required,
  size,
}: ValidatedTextFieldProps) {
  const { TextField } = usePlatformValidatedFormComponents()
  const disabled = useContext(FormDisablingContext)
  const { setInvalidations } = useContext(FormInvalidationsContext)
  const { model, setModel } = useContext(FormModelContext)
  const [value, setValue] = useState<string>(defaultValue ?? '')
  const [error, setError] = useState<boolean>(false)

  useEffect(() => {
    const formattedValue =
      type !== 'tel' ? value : (parsePhoneNumberFromString(value, 'US')?.number ?? '')
    if ((model as { [name]: string })[name] !== formattedValue) {
      setModel({ ...model, [name]: formattedValue })
    }
  }, [model, name, setModel, value])

  useEffect(() => {
    if (defaultValue !== undefined) {
      onChange(defaultValue)
    }
  }, [defaultValue])

  useEffect(() => {
    if (validator !== undefined) {
      const valid = validator(value)
      if (valid || (value === '' && !required)) {
        setInvalidations(prev => {
          if (prev.has(name)) {
            const updated = new Set([...prev])
            updated.delete(name)
            return new Set(updated)
          } else {
            return prev
          }
        })
        setError(false)
      } else if (!valid || (value === '' && required)) {
        setInvalidations(prev => {
          if (!prev.has(name)) {
            const updated = new Set([...prev])
            updated.add(name)
            return new Set(updated)
          } else {
            return prev
          }
        })
        setError(true)
      }
      return () => {
        setInvalidations(prev => {
          if (prev.has(name)) {
            const updated = new Set([...prev])
            updated.delete(name)
            return new Set(updated)
          } else {
            return prev
          }
        })
      }
    }
  }, [name, required, setInvalidations, validator, value])

  // This fixes an animation bug.
  const [initialDisplayAsDisabled, setInitialDisplayAsDisabled] = useState<boolean>(false)
  useEffect(() => {
    if (disabled) {
      setInitialDisplayAsDisabled(true)
    } else {
      new Promise(resolve => setTimeout(resolve, 10)).then(() => {
        setInitialDisplayAsDisabled(false)
      })
    }
  }, [disabled])

  const onChange = (newValue: string) => {
    if (type !== 'tel') {
      setValue(newValue)
    } else {
      const parsed = parsePhoneNumberFromString(newValue, 'US')
      if (parsed !== undefined) {
        setValue(parsed.formatNational())
      } else {
        setValue(newValue.replace(/[^0-9]/g, ''))
      }
    }
  }

  return (
    <TextField
      name={name}
      type={type}
      icon={icon}
      label={label}
      defaultValue={defaultValue}
      validator={validator}
      helperText={helperText}
      required={required}
      size={size}
      disabled={disabled}
      error={value !== '' && error}
      showHelperText={(value === '' || error) && !initialDisplayAsDisabled}
      value={value}
      onChange={onChange}
    ></TextField>
  )
}
