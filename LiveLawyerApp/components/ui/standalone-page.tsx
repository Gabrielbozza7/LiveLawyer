import { Appbar, Portal, Surface } from 'react-native-paper'
import { KeyboardAvoidingView, StyleSheet, View } from 'react-native'
import { ReactNode } from 'react'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

interface StandalonePageProps {
  title: string
  children?: ReactNode
  verticallyCenter?: boolean
  horizontallyCenter?: boolean
  disableBackButton?: boolean
}

export function StandalonePage({
  title,
  children,
  verticallyCenter,
  horizontallyCenter,
  disableBackButton,
}: StandalonePageProps) {
  const router = useRouter()

  return (
    <Surface elevation={0} style={styles.outerViews}>
      <Appbar.Header>
        {!(disableBackButton ?? false) && <Appbar.BackAction onPress={router.back} />}
        <Appbar.Content title={title} />
      </Appbar.Header>
      <KeyboardAvoidingView behavior="padding" style={styles.outerViews}>
        <SafeAreaView
          style={[
            styles.outerViews,
            verticallyCenter && styles.verticallyCentered,
            horizontallyCenter && styles.horizontallyCentered,
          ]}
          edges={['left', 'right', 'bottom']}
        >
          <Portal.Host>
            <View style={styles.innerView}>{children}</View>
          </Portal.Host>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Surface>
  )
}

const styles = StyleSheet.create({
  outerViews: { flex: 1 },
  innerView: { flex: 1, flexDirection: 'column', position: 'relative' },
  verticallyCentered: { justifyContent: 'center' },
  horizontallyCentered: { alignItems: 'center' },
})
