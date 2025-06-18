'use client'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Button, Card, Container, Form } from 'react-bootstrap'
import LiveLawyerNav from '@/components/LiveLawyerNav'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { createClient, Session, SupabaseClient } from '@supabase/supabase-js'
import { Database } from 'livelawyerlibrary/SupabaseTypes'
import Creator from './creator'
import Login from './login'

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

interface FormModel {
  firstName: string
  lastName: string
  email: string
  phoneNum: string
}

export default function Account({ supabaseUrl, supabaseAnonKey }: AccountProps) {
  const supabaseClientRef = useRef<SupabaseClient<Database>>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [session, setSession] = useState<Session | undefined>()
  const [userType, setUserType] = useState<string>('')
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [initializedSupabaseClient, setInitializedSupabaseClient] = useState<boolean>(false)
  const [activeForm, setActiveForm] = useState<ActiveForm>('Login')

  // There is blank data here because the value gets updated before ever being used.
  const [account, setAccount] = useState<FormModel>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNum: '',
  })

  // Reading the session if the user is logged in already:
  useEffect(() => {
    if (supabaseClientRef.current === null) {
      supabaseClientRef.current = createClient(supabaseUrl, supabaseAnonKey)
    }
    supabaseClientRef.current.auth.getSession().then(({ data: { session } }) => {
      setSession(session ?? undefined)
      setInitializedSupabaseClient(true)
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

  // Filling the form with the user's existing data before presenting it for editing:
  useEffect(() => {
    if (initializedSupabaseClient && session !== undefined) {
      ;(async () => {
        if (supabaseClientRef.current === null) return
        setLoading(true)
        const { data, error } = await supabaseClientRef.current
          .from('User')
          .select()
          .eq('id', session?.user.id ?? '')
          .single()
        if (error || data === null) {
          setStatusMessage(
            'Something went wrong when trying to fetch your account information! Try again later.',
          )
          setLoading(false)
          return
        }
        setAccount(data)
        setUserType(data.userType)
        setLoading(false)
      })()
    } else if (initializedSupabaseClient && session === undefined) {
      setLoading(false)
    }
  }, [initializedSupabaseClient, session])

  // Dynamically syncing the form changes to the account model:
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setAccount(prev => ({ ...prev, [name]: value }))
  }

  // Updating the database based on the new account model when the form is submitted:
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    if (supabaseClientRef.current === null) return
    e.preventDefault()
    setLoading(true)
    const { error } = await supabaseClientRef.current
      .from('User')
      .update(account)
      .eq('id', session?.user.id ?? '')
      .single()
    setStatusMessage(
      error
        ? 'Something went wrong when trying to fetch your account information! Try again later.'
        : 'Update successful!',
    )
    setLoading(false)
  }

  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (supabaseClientRef.current === null) return
    e.preventDefault()
    setLoading(true)
    try {
      await supabaseClientRef.current.auth.signOut()
    } catch {
      setStatusMessage('Something went wrong when trying to log out! Try again later.')
    } finally {
      setLoading(false)
      setActiveForm('Login')
    }
  }

  return (
    <div>
      <title>Account</title>
      <LiveLawyerNav />
      {statusMessage !== '' ? (
        <Container fluid="md" style={{ margin: 24 }}>
          <Card>
            <Card.Body>{statusMessage}</Card.Body>
          </Card>
        </Container>
      ) : loading || supabaseClientRef.current === null ? (
        <h1>Loading...</h1>
      ) : (
        <Container fluid="md" style={{ margin: 24 }}>
          {activeForm === 'Editor' ? (
            <Card>
              <Card.Body>
                <h4 className="mb-4">Account Information</h4>
                <Form onSubmit={handleSubmit}>
                  <Form.Group controlId="formFirstName" className="mt-3">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={account.firstName}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group controlId="formLastName" className="mt-3">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={account.lastName}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group controlId="formEmail" className="mt-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={account.email}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group controlId="formPhoneNum" className="mt-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phoneNum"
                      value={account.phoneNum}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Card.Text className="mt-3">Your User Type: {userType}</Card.Text>
                  <Card.Text className="mt-3">Your User ID: {session?.user.id}</Card.Text>

                  <Button variant="primary" type="submit">
                    Save Changes
                  </Button>

                  <Button variant="danger" type="button" onClick={handleLogout}>
                    Logout
                  </Button>
                </Form>
              </Card.Body>
            </Card>
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
  )
}
