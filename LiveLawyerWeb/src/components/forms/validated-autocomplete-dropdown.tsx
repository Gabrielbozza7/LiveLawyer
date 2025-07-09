import * as React from 'react'
import TextField from '@mui/material/TextField'
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete'
import { FormDisablingContext, FormInvalidationsContext, FormModelContext } from './validated-form'
import { ReactNode, useContext, useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'

interface DropdownOption {
  label: string
  isNew: boolean
}

export function toDropdownOptions(array: readonly string[]): readonly DropdownOption[] {
  return array.map(entry => ({ label: entry, isNew: false }))
}

interface ValidatedAutocompleteDropdownProps {
  name: string
  icon?: ReactNode
  label: string
  options: readonly DropdownOption[]
  canAddNew: boolean
  addNewPrefix?: string
  defaultValue?: string
  validator?: (value: string) => boolean
  helperText?: string
  required?: boolean
  size?: number
}

export default function ValidatedAutocompleteDropdown({
  name,
  icon,
  label,
  options,
  canAddNew,
  addNewPrefix,
  defaultValue,
  validator,
  helperText,
  required,
  size,
}: ValidatedAutocompleteDropdownProps) {
  const disabled = useContext(FormDisablingContext)
  const { setInvalidations } = useContext(FormInvalidationsContext)
  const { model, setModel } = useContext(FormModelContext)
  const [value, setValue] = useState<DropdownOption | null>(null)
  const [error, setError] = useState<boolean>(false)

  useEffect(() => {
    if (
      JSON.stringify((model as { [name]: DropdownOption | null })[name]) !== JSON.stringify(value)
    ) {
      setModel({ ...model, [name]: value })
    }
  }, [model, name, setModel, value])

  useEffect(() => {
    if (defaultValue !== undefined) {
      setValue({ label: defaultValue, isNew: false })
    }
  }, [defaultValue])

  useEffect(() => {
    if (validator !== undefined) {
      const valid = validator(value?.label ?? '')
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
      } else if (!valid || (value === null && required)) {
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
      <Autocomplete
        fullWidth
        disabled={disabled}
        renderInput={params => (
          <TextField
            {...params}
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
            required={required ?? false}
            error={value !== null && error}
            helperText={(value === null || error) && !displayAsDisabled && helperText}
          />
        )}
        value={value}
        onChange={(event, newValue) => {
          if (typeof newValue === 'object') {
            setValue(newValue)
            setModel(model => ({ ...model, [name]: newValue }))
          }
        }}
        filterOptions={(options, params) => {
          const filtered = createFilterOptions<DropdownOption>()(options, params)
          const { inputValue } = params

          // Suggesting the creation of a new option:
          const isExisting = options.some(option => inputValue === option.label)
          if (canAddNew && inputValue !== '' && !isExisting) {
            filtered.push({ label: inputValue, isNew: true })
          }

          return filtered
        }}
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        options={options}
        getOptionLabel={option => {
          if (typeof option === 'string') {
            return option
          } else {
            return option.label
          }
        }}
        renderOption={(props, option) => {
          const { key, ...optionProps } = props
          return (
            <li key={key} {...optionProps}>
              {option.isNew ? `${addNewPrefix ?? 'Add'} "${option.label}"` : option.label}
            </li>
          )
        }}
        freeSolo
      />
    </Grid>
  )
}
