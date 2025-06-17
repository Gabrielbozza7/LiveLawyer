'use client'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Button, Card, Container, Form } from 'react-bootstrap'
import LiveLawyerNav from '@/components/LiveLawyerNav'
import { FormEvent, useEffect, useState } from 'react'
import { createClient, Session, SupabaseClient } from '@supabase/supabase-js'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { Database } from 'livelawyerlibrary/SupabaseTypes'

let supabase: SupabaseClient<Database>

interface AccountProps {
  supabaseUrl: string
  supabaseAnonKey: string
}

interface AccountFormData {
  firstName: string
  lastName: string
  email: string
  phoneNum: string
}

export default function Account({ supabaseUrl, supabaseAnonKey }: AccountProps) {
  const [loading, setLoading] = useState<boolean>(true)
  const [session, setSession] = useState<Session | undefined>()
  const [userType, setUserType] = useState<string>('')
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [initializedSupabaseClient, setInitializedSupabaseClient] = useState<boolean>(false)

  // There is blank data here because the value gets updated before ever being used.
  const [account, setAccount] = useState<AccountFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNum: '',
  })

  // Reading the session if the user is already logged in or logs in:
  useEffect(() => {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session ?? undefined)
      setInitializedSupabaseClient(true)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? undefined)
      setInitializedSupabaseClient(true)
    })
    return () => subscription.unsubscribe()
  }, [supabaseAnonKey, supabaseUrl])

  // Filling the form with the user's existing data before presenting it for editing:
  useEffect(() => {
    if (initializedSupabaseClient && session !== undefined) {
      ;(async () => {
        setLoading(true)
        const { data, error } = await supabase
          .from('User')
          .select()
          .eq('id', session?.user.id ?? '')
          .single()
        if (error || data === null) {
          setStatusMessage(
            'Something went wrong when trying to fetch your account information! Try again later.',
          )
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
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase
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
    e.preventDefault()
    setLoading(true)
    try {
      await supabase.auth.signOut()
    } catch {
      setStatusMessage('Something went wrong when trying to log out! Try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <title>Account</title>
      <LiveLawyerNav />
      {loading ? (
        <h1>Loading...</h1>
      ) : (
        <div>
          {session ? (
            <Container fluid="md" style={{ margin: 24 }}>
              <Card>
                {statusMessage === '' ? (
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
                      <Card.Text className="mt-3">Your User ID: {session.user.id}</Card.Text>

                      <Button variant="primary" type="submit">
                        Save Changes
                      </Button>

                      <Button variant="danger" type="button" onClick={handleLogout}>
                        Logout
                      </Button>
                    </Form>
                  </Card.Body>
                ) : (
                  <Card.Body>{statusMessage}</Card.Body>
                )}
              </Card>
            </Container>
          ) : (
            <Container fluid="md" style={{ margin: 24 }}>
              <Card>
                <Card.Header>Login</Card.Header>
                <Card.Body>
                  <Auth
                    supabaseClient={supabase}
                    appearance={{ theme: ThemeSupa }}
                    providers={[]}
                  />
                </Card.Body>
              </Card>
            </Container>
          )}
        </div>
      )}
    </div>
  )
}
