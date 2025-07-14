'use client'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import { forwardRef, ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { FormDisablingContext, FormInvalidationsContext, FormModelContext } from './validated-form'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import { validatePhoneNumber } from 'livelawyerlibrary/input-validation'
import PhoneInput from 'react-phone-number-input'

interface ValidatedPhoneNumberProps {
  name: string
  icon?: ReactNode
  label: string
  defaultValue?: string
  required?: boolean
  size?: number
}

export function ValidatedPhoneNumber({
  name,
  icon,
  label,
  defaultValue,
  required,
  size,
}: ValidatedPhoneNumberProps) {
  const disabled = useContext(FormDisablingContext)
  const { setInvalidations } = useContext(FormInvalidationsContext)
  const { model, setModel } = useContext(FormModelContext)
  const [value, setValue] = useState<string>(defaultValue ?? '')
  const [error, setError] = useState<boolean>(false)

  const handleChange = useCallback(
    (newValue: string | undefined) => {
      console.log(newValue)
      setValue(newValue ?? '')
      setModel(model => ({ ...model, [name]: newValue ?? '' }))
    },
    [name, setModel],
  )

  useEffect(() => {
    if ((model as { [name]: string })[name] !== value) {
      setModel({ ...model, [name]: value })
    }
  }, [model, name, setModel, value])

  useEffect(() => {
    if (defaultValue !== undefined) {
      handleChange(defaultValue)
    }
  }, [defaultValue, handleChange])

  useEffect(() => {
    const validator = validatePhoneNumber
    const valid = validator(value)
    if (valid) {
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
  }, [name, required, setInvalidations, value])

  // This fixes an animation bug.
  const [displayAsDisabled, setDisplayAsDisabled] = useState<boolean>(false)
  useEffect(() => {
    if (disabled) {
      setDisplayAsDisabled(true)
    } else {
      new Promise(resolve => setTimeout(resolve, 10)).then(() => {
        setDisplayAsDisabled(false)
      })
    }
  }, [disabled])

  const OuterInput = forwardRef(function X(props, ref) {
    return (
      <TextField
        {...props}
        fullWidth
        disabled={disabled}
        name={name}
        label={
          <Stack direction="row" display="flex">
            {icon}
            <Typography variant="body1" sx={{ marginLeft: 0.5 }}>
              {`${label}${required ? ' *' : ''}`}
            </Typography>
          </Stack>
        }
        slotProps={{
          inputLabel: { required: false },
        }}
        inputRef={ref}
        variant="standard"
        required={required ?? false}
        error={value !== '' && error}
        helperText={
          (value === '' || error) &&
          !displayAsDisabled &&
          'Phone number must conform to E.164 format.'
        }
      />
    )
  })

  return (
    <Grid size={size ?? 12}>
      <PhoneInput
        style={{ width: '100%' }}
        disabled={disabled}
        inputComponent={OuterInput}
        value={value}
        onChange={handleChange}
        defaultCountry="US"
      ></PhoneInput>
      <Typography variant="body1">Value: {value}</Typography>
    </Grid>
  )
}
