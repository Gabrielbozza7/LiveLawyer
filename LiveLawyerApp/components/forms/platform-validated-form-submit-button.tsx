import { PlatformValidatedFormSubmitButtonProps } from 'livelawyerlibrary/forms/validated-form-submit-button'
import { ReactNode } from 'react'
import { Button } from 'react-native-paper'

export function PlatformValidatedFormSubmitButton({
  children,
  displayAsDisabled,
  submit,
}: PlatformValidatedFormSubmitButtonProps) {
  return (
    <Button
      disabled={displayAsDisabled}
      mode="elevated"
      onPress={submit}
      theme={{
        colors: {
          elevation: {
            level1: 'rgb(105, 239, 109)',
          },
        },
      }}
    >
      {children as ReactNode}
    </Button>
  )
}
