'use client'
import { createClient, Session, SupabaseClient, SupportedStorage } from '@supabase/supabase-js'
import { Database } from './database-types'
import React, {
  createContext,
  ReactNode,
  RefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import LiveLawyerApi from './api/LiveLawyerApi'
import { jwtDecode } from 'jwt-decode'

export interface PublicEnv {
  supabaseUrl: string
  supabaseAnonKey: string
  backendUrl: string
}

const PublicEnvContext = createContext<PublicEnv | null>(null)
const SupabaseClientContext = createContext<RefObject<SupabaseClient<Database>> | null>(null)
const SessionContext = createContext<RefObject<Session> | null>(null)
const UserTypeContext = createContext<Database['public']['Enums']['UserType'] | null>(null)
const ApiContext = createContext<RefObject<LiveLawyerApi> | null>(null)

export function usePublicEnv(): PublicEnv {
  const context = useContext(PublicEnvContext)
  if (context === null) {
    throw new Error("Cannot use 'usePublicEnv' hook outside of a ContextManager")
  }
  return context
}

export function useSupabaseClient(): RefObject<SupabaseClient<Database>> {
  const context = useContext(SupabaseClientContext)
  if (context === null) {
    throw new Error("Cannot use 'useSupabaseClient' hook outside of a ContextManager")
  }
  return context
}

export function useSession(): RefObject<Session> {
  const context = useContext(SessionContext)
  if (context === null) {
    throw new Error("Cannot use 'useSession' hook outside of a ContextManager")
  }
  return context
}

export function useUserType(): Database['public']['Enums']['UserType'] {
  const context = useContext(UserTypeContext)
  if (context === null) {
    throw new Error("Cannot use 'useUserType' hook outside of a ContextManager")
  }
  return context
}

export function useApi(): RefObject<LiveLawyerApi> {
  const context = useContext(ApiContext)
  if (context === null) {
    throw new Error("Cannot use 'useApi' hook outside of a ContextManager")
  }
  return context
}

interface ContextManagerProps {
  env: PublicEnv
  sessionlessComponent: ReactNode
  storage?: SupportedStorage
  loadingComponent?: ReactNode
  uninitializedUserComponent?: ReactNode
  children?: ReactNode
}

export function ContextManager({
  env,
  sessionlessComponent,
  storage,
  loadingComponent,
  uninitializedUserComponent,
  children,
}: ContextManagerProps) {
  const supabaseClientRef = useRef<SupabaseClient<Database> | null>(null)
  const sessionRef = useRef<Session | null>(null)
  const [userType, setUserType] = useState<Database['public']['Enums']['UserType'] | null>(null)
  const apiRef = useRef<LiveLawyerApi | null>(null)
  const [clientInitialized, setClientInitialized] = useState<boolean>(false)

  useEffect(() => {
    supabaseClientRef.current = createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        storage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
    apiRef.current = new LiveLawyerApi(
      env.backendUrl,
      () => (sessionRef as RefObject<Session>).current?.access_token,
    )
    const {
      data: { subscription },
    } = supabaseClientRef.current.auth.onAuthStateChange((event, session) => {
      if (sessionRef.current !== session) {
        sessionRef.current = session
      }
      if (session !== null) {
        const decodedJwt = jwtDecode(session?.access_token)
        setUserType(
          (decodedJwt as { user_metadata: { user_type: string } }).user_metadata
            .user_type as Database['public']['Enums']['UserType'],
        )
      } else {
        setUserType(null)
      }
    })
    setClientInitialized(true)

    return () => {
      subscription.unsubscribe()
    }
  }, [clientInitialized, env.backendUrl, env.supabaseAnonKey, env.supabaseUrl])

  return (
    <PublicEnvContext.Provider value={env}>
      {clientInitialized ? (
        <>
          <SupabaseClientContext.Provider
            value={supabaseClientRef as RefObject<SupabaseClient<Database>>}
          >
            {userType === null ? (
              <>{sessionlessComponent}</>
            ) : (
              <SessionContext.Provider value={sessionRef as RefObject<Session>}>
                <UserTypeContext.Provider value={userType}>
                  <ApiContext.Provider value={apiRef as RefObject<LiveLawyerApi>}>
                    {uninitializedUserComponent !== undefined && userType === 'Uninitialized' ? (
                      <>{uninitializedUserComponent}</>
                    ) : (
                      <>{children ?? <></>}</>
                    )}
                  </ApiContext.Provider>
                </UserTypeContext.Provider>
              </SessionContext.Provider>
            )}
          </SupabaseClientContext.Provider>
        </>
      ) : (
        <>{loadingComponent ?? <></>}</>
      )}
    </PublicEnvContext.Provider>
  )
}
