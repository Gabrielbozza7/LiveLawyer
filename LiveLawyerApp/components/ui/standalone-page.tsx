import { Appbar, Surface } from 'react-native-paper'
import { StyleSheet, View } from 'react-native'
import { ReactNode } from 'react'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

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
    <Surface elevation={0} style={styles.outerViews}>
      <Appbar.Header>
        <Appbar.BackAction onPress={router.back} />
        <Appbar.Content title={title} />
      </Appbar.Header>
      <SafeAreaView
        style={[
          styles.outerViews,
          verticallyCenter && styles.verticallyCentered,
          horizontallyCenter && styles.horizontallyCentered,
        ]}
        edges={['left', 'right', 'bottom']}
      >
        <View style={styles.innerView}>{children}</View>
      </SafeAreaView>
    </Surface>
  )
}

const styles = StyleSheet.create({
  outerViews: { flex: 1 },
  innerView: { flex: 1, flexDirection: 'column', position: 'relative' },
  verticallyCentered: { justifyContent: 'center' },
  horizontallyCentered: { alignItems: 'center' },
})
