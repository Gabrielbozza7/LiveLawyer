import { AlertMessage, useAlerter } from 'livelawyerlibrary/context-manager'
import { useEffect, useState } from 'react'
import { StyleSheet } from 'react-native'
import { Icon, Portal, Snackbar, Text } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'

export function AlertDelivery() {
  const alerterRef = useAlerter()
  const [message, setMessage] = useState<AlertMessage | null>(null)
  const [open, setOpen] = useState<boolean>(false)

  const showAlert = (message: AlertMessage) => {
    setMessage(message)
    setOpen(true)
  }

  const hideAlert = async () => {
    setOpen(false)
    await new Promise(resolve => setTimeout(resolve, 500))
    if (!open) {
      setMessage(null)
    }
  }

  useEffect(() => {
    const alerter = alerterRef.current
    alerter.addCallback(showAlert)
    return () => {
      alerter.removeCallback(showAlert)
    }
  }, [alerterRef])

  return (
    <Portal>
      <SafeAreaView>
        <Snackbar
          visible={open}
          onDismiss={hideAlert}
          style={styles.snackbar}
          action={{
            label: '',
            labelStyle: { display: 'none' },
            icon: ({ size }) => <Icon source="close" color="white" size={size} />,
            compact: true,
            buttonColor: 'transparent',
            rippleColor: 'transparent',
            style: { justifyContent: 'center', width: 40, height: 40 },
          }}
          theme={{
            colors: {
              inverseSurface:
                message === null ? 'purple' : message.kind === 'SUCCESS' ? 'green' : 'red', // background color
              inverseOnSurface: 'white', // icon color
            },
          }}
        >
          <Text theme={{ colors: { onSurface: 'white' } }}>{message?.message}</Text>
        </Snackbar>
      </SafeAreaView>
    </Portal>
  )
}

const styles = StyleSheet.create({
  snackbar: { position: 'absolute', top: 0, left: 0, right: 0 },
})
