'use client'
import 'bootstrap/dist/css/bootstrap.min.css'
import { createClient, Session, SupabaseClient } from '@supabase/supabase-js'
import { Database } from 'livelawyerlibrary/database-types'
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react'
import { PublicEnv } from '@/classes/PublicEnv'
import LiveLawyerApi from 'livelawyerlibrary/api/LiveLawyerApi'

export class SessionProvider {
  private readonly _supabaseClient: SupabaseClient<Database>
  private readonly _invalidateSessionCallback: () => void

  /**
   * This constructor should only ever be called from the ContextManager component.
   */
  constructor(supabaseClient: SupabaseClient<Database>, invalidateSessionCallback: () => void) {
    this._supabaseClient = supabaseClient
    this._invalidateSessionCallback = invalidateSessionCallback
  }

  public async getFreshSession(): Promise<Session> {
    const {
      data: { session },
      error,
    } = await this._supabaseClient.auth.getSession()
    if (error || session === null) {
      this._invalidateSessionCallback()
      throw new Error('Invalid session!')
    }
    return session
  }
}

interface SessionData {
  api: LiveLawyerApi
  userId: string
  accessToken: string
}

const PublicEnvContext = createContext<PublicEnv | null>(null)
const SupabaseClientContext = createContext<SupabaseClient<Database> | null>(null)
const SessionDataContext = createContext<SessionData | null>(null)

interface ContextManagerProps {
  env: PublicEnv
  sessionlessComponent: ReactNode
  children?: ReactNode
}

export function usePublicEnv(): PublicEnv {
  const context = useContext(PublicEnvContext)
  if (context === null) {
    throw new Error("Cannot use 'usePublicEnv' hook outside of a ContextManager")
  }
  return context
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

export function ContextManager({ env, sessionlessComponent, children }: ContextManagerProps) {
  const publicEnv = env
  // The Supabase client is stored with a ref to avoid re-rendering on authentication changes.
  const supabaseClientRef = useRef<SupabaseClient<Database>>(
    createClient(env.supabaseUrl, env.supabaseAnonKey, { auth: { autoRefreshToken: true } }),
  )
  const [userId, setUserId] = useState<string | undefined>(undefined)
  const [accessToken, setAccessToken] = useState<string | null | undefined>(undefined)

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
    <PublicEnvContext value={publicEnv}>
      <SupabaseClientContext value={supabaseClientRef.current}>
        {accessToken === undefined ? (
          <p>Loading...</p>
        ) : accessToken === null || userId === undefined ? (
          <>{sessionlessComponent}</>
        ) : (
          <SessionDataContext
            value={{
              api: new LiveLawyerApi(publicEnv.backendUrl, accessToken),
              userId,
              accessToken,
            }}
          >
            {children ?? <></>}
          </SessionDataContext>
        )}
      </SupabaseClientContext>
    </PublicEnvContext>
  )
}
