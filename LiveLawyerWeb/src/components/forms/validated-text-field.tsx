import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import { ReactNode, useContext, useEffect, useState } from 'react'
import { FormDisablingContext, FormInvalidationsContext, FormModelContext } from './validated-form'

interface ValidatedTextFieldProps {
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
  const disabled = useContext(FormDisablingContext)
  const { setInvalidations } = useContext(FormInvalidationsContext)
  const { model, setModel } = useContext(FormModelContext)
  const [value, setValue] = useState<string>(defaultValue ?? '')
  const [error, setError] = useState<boolean>(false)

  useEffect(() => {
    if ((model as { [name]: string })[name] !== value) {
      setModel({ ...model, [name]: value })
    }
  }, [model, name, setModel, value])

  useEffect(() => {
    if (defaultValue !== undefined) {
      setValue(defaultValue)
    }
  }, [defaultValue])

  useEffect(() => {
    if (validator !== undefined) {
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
    }
  }, [name, required, setInvalidations, validator, value])

  return (
    <Grid size={size ?? 12}>
      <TextField
        fullWidth
        disabled={disabled}
        type={type}
        name={name}
        label={
          <>
            {icon === undefined ? (
              label
            ) : (
              <>
                {icon}
                {` ${label}`}
              </>
            )}
          </>
        }
        variant="standard"
        value={value}
        onChange={event => {
          setValue(event.target.value)
          setModel(model => ({ ...model, [name]: event.target.value }))
        }}
        required={required ?? false}
        error={value !== '' && error}
        helperText={(value === '' || error) && helperText}
      />
    </Grid>
  )
}
