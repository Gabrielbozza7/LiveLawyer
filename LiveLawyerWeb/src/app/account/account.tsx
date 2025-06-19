'use client'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Card, Container } from 'react-bootstrap'
import LiveLawyerNav, { SessionReadyCallbackArg } from '@/components/LiveLawyerNav'
import { useEffect, useRef, useState } from 'react'
import { Session, Subscription, SupabaseClient } from '@supabase/supabase-js'
import { Database } from 'livelawyerlibrary/SupabaseTypes'
import Creator from './creator'
import Login from './login'
import Editor from './editor'
import { PublicEnv } from '@/classes/PublicEnv'

export type ActiveForm = 'Login' | 'Editor' | 'Creator'

export interface AccountSubFormProps {
  setLoading: (loading: boolean) => void
  setStatusMessage: (statusMessage: string) => void
  setActiveForm: (activeForm: ActiveForm) => void
  supabase: SupabaseClient<Database>
  session: Session | undefined
}

export default function Account({ env }: { env: PublicEnv }) {
  const supabaseRef = useRef<SupabaseClient<Database>>(null)
  const sessionRef = useRef<Session>(null)
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [initialized, setInitialized] = useState<boolean>(false)
  const [activeForm, setActiveForm] = useState<ActiveForm>('Login')
  const loginSubscriptionRef = useRef<Subscription>(null)

  const sessionReadyCallback = ({ supabase, session }: SessionReadyCallbackArg) => {
    supabaseRef.current = supabase
    sessionRef.current = session

    // Reading the session if the user logs in:
    const {
      data: { subscription },
    } = supabaseRef.current.auth.onAuthStateChange((_event, session) => {
      sessionRef.current = session
      setInitialized(true)
    })
    loginSubscriptionRef.current = subscription

    setInitialized(true)
    setLoading(false)
  }

  useEffect(() => {
    return () => {
      if (loginSubscriptionRef.current !== null) {
        loginSubscriptionRef.current.unsubscribe()
        loginSubscriptionRef.current = null
      }
    }
  }, [])

  return (
    <div>
      <LiveLawyerNav env={env} sessionReadyCallback={sessionReadyCallback} />
      <div hidden={!(loading || supabaseRef.current === null || !initialized)}>
        <h1>Loading...</h1>
      </div>
      {statusMessage !== '' ? (
        <Container fluid="md" style={{ margin: 24 }}>
          <Card>
            <Card.Body>{statusMessage}</Card.Body>
          </Card>
        </Container>
      ) : (
        <div hidden={loading || supabaseRef.current === null || !initialized}>
          {supabaseRef.current !== null && initialized && (
            <Container fluid="md" style={{ margin: 24 }}>
              {activeForm === 'Editor' ? (
                <Editor
                  setLoading={setLoading}
                  setStatusMessage={setStatusMessage}
                  setActiveForm={setActiveForm}
                  supabase={supabaseRef.current}
                  session={sessionRef.current ?? undefined}
                />
              ) : activeForm === 'Login' ? (
                <Login
                  setLoading={setLoading}
                  setStatusMessage={setStatusMessage}
                  setActiveForm={setActiveForm}
                  supabase={supabaseRef.current}
                  session={sessionRef.current ?? undefined}
                />
              ) : activeForm === 'Creator' ? (
                <Creator
                  setLoading={setLoading}
                  setStatusMessage={setStatusMessage}
                  setActiveForm={setActiveForm}
                  supabase={supabaseRef.current}
                  session={sessionRef.current ?? undefined}
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
