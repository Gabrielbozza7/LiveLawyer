import * as SecureStore from 'expo-secure-store'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from 'livelawyerlibrary/database-types'
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react'
import { AppState, Text } from 'react-native'
import LiveLawyerApi from 'livelawyerlibrary/api/LiveLawyerApi'
import { BACKEND_URL } from '@/constants/BackendVariables'

interface SessionData {
  api: LiveLawyerApi
  userId: string
  accessToken: string
}

const SupabaseClientContext = createContext<SupabaseClient<Database> | null>(null)
const SessionDataContext = createContext<SessionData | null>(null)

interface ContextManagerProps {
  sessionlessComponent: ReactNode
  children?: ReactNode
}

export function useSupabaseClient(): SupabaseClient<Database> {
  const context = useContext(SupabaseClientContext)
  if (context === null) {
    throw new Error("Cannot use 'useSupabaseClient' hook outside of a ContextManager")
  }
  return context
}

export function useSessionData(): SessionData {
  const context = useContext(SessionDataContext)
  if (context === null) {
    throw new Error("Cannot use 'useSessionData' hook outside of a ContextManager")
  }
  return context
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key)
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value)
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key)
  },
}

export function ContextManager({ sessionlessComponent, children }: ContextManagerProps) {
  // The Supabase client is stored with a ref to avoid re-rendering on authentication changes.
  const supabaseClientRef = useRef<SupabaseClient<Database>>(
    createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        storage: ExpoSecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    }),
  )
  const [userId, setUserId] = useState<string | undefined>(undefined)
  const [accessToken, setAccessToken] = useState<string | null | undefined>(undefined)

  useEffect(() => {
    // Tells Supabase Auth to continuously refresh the session automatically if
    // the app is in the foreground. When this is added, you will continue to receive
    // `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
    // if the user's session is terminated. This should only be registered once.
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        supabaseClientRef.current.auth.startAutoRefresh()
      } else {
        supabaseClientRef.current.auth.stopAutoRefresh()
      }
    })
    return () => {
      subscription.remove()
    }
  }, [])

  useEffect(() => {
    let localAccessToken: string | null | undefined = undefined
    const {
      data: { subscription },
    } = supabaseClientRef.current.auth.onAuthStateChange((event, session) => {
      if (session !== null && localAccessToken !== session.access_token) {
        setUserId(session.user.id)
        setAccessToken(session.access_token)
        localAccessToken = session.access_token
      } else if (session === null && localAccessToken !== null) {
        setUserId(undefined)
        setAccessToken(null)
        localAccessToken = null
      }
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <SupabaseClientContext.Provider value={supabaseClientRef.current}>
      {accessToken === undefined ? (
        <Text>Loading...</Text>
      ) : accessToken === null || userId === undefined ? (
        <>{sessionlessComponent}</>
      ) : (
        <SessionDataContext.Provider
          value={{
            api: new LiveLawyerApi(BACKEND_URL, accessToken),
            userId,
            accessToken,
          }}
        >
          {children ?? <></>}
        </SessionDataContext.Provider>
      )}
    </SupabaseClientContext.Provider>
  )
}
