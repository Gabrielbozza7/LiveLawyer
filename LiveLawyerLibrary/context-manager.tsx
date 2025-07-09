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

export interface AlertMessage {
  kind: 'SUCCESS' | 'ERROR'
  message: string
}

export class Alerter {
  private readonly _callbacks: ((alert: AlertMessage) => void)[]

  constructor() {
    this._callbacks = []
  }

  public addCallback(callback: (alert: AlertMessage) => void): void {
    this._callbacks.push(callback)
  }

  public removeCallback(callback: (alert: AlertMessage) => void): boolean {
    const index = this._callbacks.findIndex(x => x === callback)
    if (index === -1) {
      return false
    }
    this._callbacks.splice(index, 1)
    return true
  }

  public success(message: string): void {
    this._callbacks.forEach(callback => callback({ kind: 'SUCCESS', message }))
  }

  public error(message: string): void {
    this._callbacks.forEach(callback => callback({ kind: 'ERROR', message }))
  }
}

const PublicEnvContext = createContext<PublicEnv | null>(null)
const AlerterContext = createContext<RefObject<Alerter> | null>(null)
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

export function useAlerter(): RefObject<Alerter> {
  const context = useContext(AlerterContext)
  if (context === null) {
    throw new Error("Cannot use 'useAlerter' hook outside of a ContextManager")
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
  alertDeliveryComponent: ReactNode
  storage?: SupportedStorage
  loadingComponent?: ReactNode
  uninitializedUserComponent?: ReactNode
  children?: ReactNode
}

export function ContextManager({
  env,
  sessionlessComponent,
  alertDeliveryComponent,
  storage,
  loadingComponent,
  uninitializedUserComponent,
  children,
}: ContextManagerProps) {
  const alerterRef = useRef<Alerter | null>(null)
  const supabaseClientRef = useRef<SupabaseClient<Database> | null>(null)
  const sessionRef = useRef<Session | null>(null)
  const [userType, setUserType] = useState<Database['public']['Enums']['UserType'] | null>(null)
  const apiRef = useRef<LiveLawyerApi | null>(null)
  const [clientInitialized, setClientInitialized] = useState<boolean>(false)

  useEffect(() => {
    alerterRef.current = new Alerter()
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
  }, [env.backendUrl, env.supabaseAnonKey, env.supabaseUrl])

  return (
    <PublicEnvContext.Provider value={env}>
      <AlerterContext.Provider value={alerterRef as RefObject<Alerter>}>
        {clientInitialized ? (
          <>
            {alertDeliveryComponent}
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
      </AlerterContext.Provider>
    </PublicEnvContext.Provider>
  )
}
