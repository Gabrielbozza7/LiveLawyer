import { useEffect, useRef } from 'react'
import { useRootNavigationState, useRouter } from 'expo-router'

export default function Index() {
  const router = useRouter()
  const rootNavigationState = useRootNavigationState()
  const initialNavigatorState = useRef<string | undefined>(undefined)

  // The logic here is supposed to make the router navigate to the main tabs screen
  // when the router's root navigation state changes. If this check isn't performed,
  // the app crashes.

  useEffect(() => {
    initialNavigatorState.current = rootNavigationState?.key
  }, [])

  useEffect(() => {
    if (rootNavigationState?.key !== initialNavigatorState.current) {
      router.replace('/(tabs)')
    }
  }, [rootNavigationState?.key])
}
