import TextField from '@mui/material/TextField'
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete'
import { FormDisablingContext, FormInvalidationsContext, FormModelContext } from './validated-form'
import { ReactNode, useContext, useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export type AutocompleteOptionNotNew<T extends object> = {
  label: string
  isNew: false
  extra: T
}

export type AutocompleteOptionNew = {
  label: string
  isNew: true
}

export type AutocompleteOption<T extends object> =
  | AutocompleteOptionNotNew<T>
  | AutocompleteOptionNew

interface ValidatedAutocompleteDropdownProps<T extends object> {
  name: string
  icon?: ReactNode
  label: string
  options: readonly AutocompleteOption<T>[]
  canAddNew: boolean
  addNewPrefix?: string
  defaultValue?: AutocompleteOption<T> | null
  validator?: (value: string) => boolean
  helperText?: string
  required?: boolean
  size?: number
}

export default function ValidatedAutocompleteDropdown<T extends object>({
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
}: ValidatedAutocompleteDropdownProps<T>) {
  const disabled = useContext(FormDisablingContext)
  const { setInvalidations } = useContext(FormInvalidationsContext)
  const { model, setModel } = useContext(FormModelContext)
  const [value, setValue] = useState<AutocompleteOption<T> | null>(null)
  const [error, setError] = useState<boolean>(false)

  useEffect(() => {
    if (
      JSON.stringify((model as { [name]: AutocompleteOption<T> | null })[name]) !==
      JSON.stringify(value)
    ) {
      setModel({ ...model, [name]: value })
    }
  }, [model, name, setModel, value])

  useEffect(() => {
    if (defaultValue !== undefined) {
      setValue(defaultValue)
    }
  }, [defaultValue, options])

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
              <Stack direction="row" display="flex">
                {icon}
                <Typography variant="body1" sx={{ marginLeft: 0.5 }}>
                  {`${label}${required ? ' *' : ''}`}
                </Typography>
              </Stack>
            }
            slotProps={{ inputLabel: { required: false } }}
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
          const filtered = createFilterOptions<AutocompleteOption<T>>()(options, params)
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
