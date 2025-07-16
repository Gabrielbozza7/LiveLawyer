import { HelperText, TextInput } from 'react-native-paper'
import { View } from 'react-native'
import { PlatformValidatedTextFieldProps } from 'livelawyerlibrary/forms/validated-text-field'
import { ReactNode } from 'react'

export function PlatformValidatedTextField({
  type,
  icon,
  label,
  helperText,
  required,
  disabled,
  error,
  showHelperText,
  value,
  onChange,
}: PlatformValidatedTextFieldProps) {
  return (
    <View>
      <TextInput
        disabled={disabled}
        left={icon as ReactNode}
        label={`${label}${required ? ' *' : ''}`}
        mode="flat"
        value={value}
        onChangeText={onChange}
        error={value !== '' && error}
        underlineColor="black"
        activeUnderlineColor="black"
        keyboardType={type !== 'tel' ? 'default' : 'phone-pad'}
      ></TextInput>
      <HelperText type={error ? 'error' : 'info'} visible={showHelperText}>
        {helperText}
      </HelperText>
    </View>
  )
}
