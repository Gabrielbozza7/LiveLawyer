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
  name: string
  email: string
  phone: string
  address: string
}

export default function Account({ supabaseUrl, supabaseAnonKey }: AccountProps) {
  const [loading, setLoading] = useState<boolean>(true)
  const [session, setSession] = useState<Session | undefined>()
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [initializedSupabaseClient, setInitializedSupabaseClient] = useState<boolean>(false)

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
        setAccount(template => {
          return { ...template, name: data.firstName }
        })
        setLoading(false)
      })()
    } else if (initializedSupabaseClient && session === undefined) {
      setLoading(false)
    }
  }, [initializedSupabaseClient, session])

  const [account, setAccount] = useState<AccountFormData>({
    name: '',
    email: 'Goodman@GoodmanLaw.com',
    phone: '123-456-7890',
    address: 'Goodman Law Office',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setAccount(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase
      .from('User')
      .update({ firstName: account.name })
      .eq('id', session?.user.id ?? '')
      .single()
    setStatusMessage(
      error
        ? 'Something went wrong when trying to fetch your account information! Try again later.'
        : 'Update succesful!',
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
                      <Form.Group controlId="formName">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={account.name}
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

                      <Form.Group controlId="formPhone" className="mt-3">
                        <Form.Label>Phone</Form.Label>
                        <Form.Control
                          type="text"
                          name="phone"
                          value={account.phone}
                          onChange={handleChange}
                        />
                      </Form.Group>

                      <Form.Group controlId="formAddress" className="mt-3">
                        <Form.Label>Office</Form.Label>
                        <Form.Control
                          type="text"
                          name="address"
                          value={account.address}
                          onChange={handleChange}
                        />
                      </Form.Group>

                      <br />
                      <Card.Text>Your User ID: {session.user.id}</Card.Text>

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
