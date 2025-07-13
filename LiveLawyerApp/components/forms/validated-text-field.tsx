import { ReactNode, useContext, useEffect, useState } from 'react'
import { FormDisablingContext, FormInvalidationsContext, FormModelContext } from './validated-form'
import { HelperText, TextInput } from 'react-native-paper'
import { View } from 'react-native'

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
  icon,
  label,
  defaultValue,
  validator,
  helperText,
  required,
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
    <View>
      <TextInput
        disabled={disabled}
        left={icon}
        label={`${label}${required ? ' *' : ''}`}
        mode="flat"
        value={value}
        onChangeText={newValue => {
          setValue(newValue)
          setModel(model => ({ ...model, [name]: newValue }))
        }}
        error={value !== '' && error}
        underlineColor="black"
        activeUnderlineColor="black"
      ></TextInput>
      <HelperText
        type={value !== '' && error ? 'error' : 'info'}
        visible={(value === '' || error) && !displayAsDisabled}
      >
        {helperText}
      </HelperText>
    </View>
  )
}
