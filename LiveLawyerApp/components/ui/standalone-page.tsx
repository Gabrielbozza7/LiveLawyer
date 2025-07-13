import { Appbar, Surface } from 'react-native-paper'
import { StyleSheet } from 'react-native'
import { ReactNode } from 'react'
import { useRouter } from 'expo-router'

interface StandalonePageProps {
  title: string
  children?: ReactNode
  verticallyCenter?: boolean
  horizontallyCenter?: boolean
}

export function StandalonePage({
  title,
  children,
  verticallyCenter,
  horizontallyCenter,
}: StandalonePageProps) {
  const router = useRouter()

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={router.back} />
        <Appbar.Content title={title} />
      </Appbar.Header>
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
    </>
  )
}

const styles = StyleSheet.create({
  surface: { height: '100%', flex: 1, flexDirection: 'column' },
  verticallyCentered: { justifyContent: 'center' },
  horizontallyCentered: { alignItems: 'center' },
})
