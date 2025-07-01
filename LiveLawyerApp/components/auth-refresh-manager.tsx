import { ReactNode, useEffect } from 'react'
import { AppState } from 'react-native'
import { useSupabaseClient } from 'livelawyerlibrary/context-manager'

interface AuthRefreshManagerProps {
  children: ReactNode
}

export function AuthRefreshManager({ children }: AuthRefreshManagerProps) {
  const supabaseRef = useSupabaseClient()

  useEffect(() => {
    // Tells Supabase Auth to continuously refresh the session automatically if
    // the app is in the foreground. When this is added, you will continue to receive
    // `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
    // if the user's session is terminated. This should only be registered once.
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        supabaseRef.current.auth.startAutoRefresh()
      } else {
        supabaseRef.current.auth.stopAutoRefresh()
      }
    })
    return () => {
      subscription.remove()
    }
  }, [])

  return <>{children}</>
}
