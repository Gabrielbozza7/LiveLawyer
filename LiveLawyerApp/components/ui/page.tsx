import { Surface } from 'react-native-paper'
import { StyleSheet } from 'react-native'
import { ReactNode } from 'react'

interface PageProps {
  children?: ReactNode
  verticallyCenter?: boolean
  horizontallyCenter?: boolean
}

export function Page({ children, verticallyCenter, horizontallyCenter }: PageProps) {
  return (
    <Surface
      elevation={0}
      style={[
        styles.surface,
        verticallyCenter && styles.verticallyCentered,
        horizontallyCenter && styles.horizontallyCentered,
      ]}
    >
      {children}
    </Surface>
  )
}

const styles = StyleSheet.create({
  surface: { height: '100%', flex: 1, flexDirection: 'column' },
  verticallyCentered: { justifyContent: 'center' },
  horizontallyCentered: { alignItems: 'center' },
})
