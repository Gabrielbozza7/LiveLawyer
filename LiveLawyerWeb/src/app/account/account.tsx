'use client'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Card, Container } from 'react-bootstrap'
import LiveLawyerNav from '@/components/LiveLawyerNav'
import { useEffect, useRef, useState } from 'react'
import { createClient, Session, SupabaseClient } from '@supabase/supabase-js'
import { Database } from 'livelawyerlibrary/SupabaseTypes'
import Creator from './creator'
import Login from './login'
import Editor from './editor'

export type ActiveForm = 'Login' | 'Editor' | 'Creator'

export interface AccountSubFormProps {
  setLoading: (loading: boolean) => void
  setStatusMessage: (statusMessage: string) => void
  setActiveForm: (activeForm: ActiveForm) => void
  supabase: SupabaseClient<Database>
  session: Session | undefined
}

interface AccountProps {
  supabaseUrl: string
  supabaseAnonKey: string
}

export default function Account({ supabaseUrl, supabaseAnonKey }: AccountProps) {
  const supabaseClientRef = useRef<SupabaseClient<Database>>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [session, setSession] = useState<Session | undefined>()
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [initializedSupabaseClient, setInitializedSupabaseClient] = useState<boolean>(false)
  const [activeForm, setActiveForm] = useState<ActiveForm>('Login')

  // Reading the session if the user is logged in already:
  useEffect(() => {
    if (supabaseClientRef.current === null) {
      supabaseClientRef.current = createClient(supabaseUrl, supabaseAnonKey)
    }
    supabaseClientRef.current.auth.getSession().then(({ data: { session } }) => {
      setSession(session ?? undefined)
      setInitializedSupabaseClient(true)
      setLoading(false)
    })
  }, [supabaseAnonKey, supabaseUrl])

  // Reading the session if the user logs in:
  useEffect(() => {
    if (supabaseClientRef.current === null) {
      return
    }
    const {
      data: { subscription },
    } = supabaseClientRef.current.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? undefined)
      setInitializedSupabaseClient(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <div>
      <LiveLawyerNav />
      <div hidden={!(loading || supabaseClientRef.current === null || !initializedSupabaseClient)}>
        <h1>Loading...</h1>
      </div>
      {statusMessage !== '' ? (
        <Container fluid="md" style={{ margin: 24 }}>
          <Card>
            <Card.Body>{statusMessage}</Card.Body>
          </Card>
        </Container>
      ) : (
        <div hidden={loading || supabaseClientRef.current === null || !initializedSupabaseClient}>
          {supabaseClientRef.current !== null && initializedSupabaseClient && (
            <Container fluid="md" style={{ margin: 24 }}>
              {activeForm === 'Editor' ? (
                <Editor
                  setLoading={setLoading}
                  setStatusMessage={setStatusMessage}
                  setActiveForm={setActiveForm}
                  supabase={supabaseClientRef.current}
                  session={session}
                />
              ) : activeForm === 'Login' ? (
                <Login
                  setLoading={setLoading}
                  setStatusMessage={setStatusMessage}
                  setActiveForm={setActiveForm}
                  supabase={supabaseClientRef.current}
                  session={session}
                />
              ) : activeForm === 'Creator' ? (
                <Creator
                  setLoading={setLoading}
                  setStatusMessage={setStatusMessage}
                  setActiveForm={setActiveForm}
                  supabase={supabaseClientRef.current}
                  session={session}
                />
              ) : (
                <p>Uh oh.</p>
              )}
            </Container>
          )}
        </div>
      )}
    </div>
  )
}
