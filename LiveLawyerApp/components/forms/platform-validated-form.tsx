import { ValidatedFormProps } from 'livelawyerlibrary/forms/validated-form'
import { ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'

export function PlatformValidatedForm<T extends object>({
  spacing,
  children,
}: ValidatedFormProps<T>) {
  return <View style={[styles.grid, { gap: spacing ?? 18 }]}>{children as ReactNode}</View>
}

const styles = StyleSheet.create({
  grid: { display: 'flex', flexDirection: 'column', margin: 24 },
})
