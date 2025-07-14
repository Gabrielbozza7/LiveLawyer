import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import { ReactNode, useContext, useEffect, useState } from 'react'
import { FormDisablingContext, FormInvalidationsContext, FormModelContext } from './validated-form'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import { parsePhoneNumberFromString } from 'libphonenumber-js'

interface ValidatedPhoneNumberProps {
  name: string
  icon?: ReactNode
  label: string
  defaultValue?: string
  validator?: (value: string) => boolean
  helperText?: string
  required?: boolean
  size?: number
}

export function ValidatedPhoneNumber({
  name,
  icon,
  label,
  defaultValue,
  validator,
  helperText,
  required,
  size,
}: ValidatedPhoneNumberProps) {
  const disabled = useContext(FormDisablingContext)
  const { setInvalidations } = useContext(FormInvalidationsContext)
  const { model, setModel } = useContext(FormModelContext)
  const [realValue, setRealValue] = useState<string>(defaultValue ?? '')
  const [value, setValue] = useState<string>(defaultValue ?? '')
  const [error, setError] = useState<boolean>(false)

  useEffect(() => {
    if ((model as { [name]: string })[name] !== realValue) {
      setModel({ ...model, [name]: realValue })
    }
  }, [model, name, setModel, realValue])

  useEffect(() => {
    if (defaultValue !== undefined) {
      const parsed = parsePhoneNumberFromString(defaultValue, 'US')
      if (parsed !== undefined) {
        setValue(parsed.formatNational())
      }
    }
  }, [defaultValue])

  useEffect(() => {
    const parsed = parsePhoneNumberFromString(value, 'US')
    setRealValue(parsed?.number ?? '')
    setModel(model => ({ ...model, [name]: parsed?.number ?? '' }))
  }, [name, setModel, value])

  useEffect(() => {
    if (validator !== undefined) {
      const valid = validator(realValue)
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
      } else if (!valid || (realValue === '' && required)) {
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
  }, [name, realValue, required, setInvalidations, validator])

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

  return (
    <Grid size={size ?? 12}>
      <TextField
        fullWidth
        disabled={disabled}
        type="tel"
        name={name}
        label={
          <Stack direction="row" display="flex">
            {icon}
            <Typography variant="body1" sx={{ marginLeft: 0.5 }}>
              {`${label}${required ? ' *' : ''}`}
            </Typography>
          </Stack>
        }
        slotProps={{ inputLabel: { required: false } }}
        variant="standard"
        value={value}
        onChange={event => {
          const parsed = parsePhoneNumberFromString(event.target.value, 'US')
          if (parsed !== undefined) {
            setValue(parsed.formatNational())
          } else {
            setValue(event.target.value)
          }
        }}
        required={required ?? false}
        error={value !== '' && error}
        helperText={(value === '' || error) && !displayAsDisabled && helperText}
      />
    </Grid>
  )
}
