import Link from 'next/link'
import { Nav, Navbar } from 'react-bootstrap'
import Image from 'next/image'
import { createClient, Session, SupabaseClient } from '@supabase/supabase-js'
import { Database } from 'livelawyerlibrary/database-types'
import { useEffect, useRef, useState } from 'react'
import { PublicEnv } from '@/classes/PublicEnv'

export interface SessionReadyCallbackArg {
  supabase: SupabaseClient<Database>
  session: Session | null
}

interface LiveLawyerNavProps {
  env: PublicEnv
  sessionReadyCallback?: (arg: SessionReadyCallbackArg) => unknown
}

export default function LiveLawyerNav({ env, sessionReadyCallback }: LiveLawyerNavProps) {
  const supabaseClientRef = useRef<SupabaseClient<Database>>(null)
  const sessionRef = useRef<Session>(null)
  const [startedRetrieval, setStartedRetrieval] = useState<boolean>(false)

  // Reading the session if prompted by parent:
  useEffect(() => {
    if (!startedRetrieval && sessionReadyCallback) {
      setStartedRetrieval(true)
      if (supabaseClientRef.current === null) {
        supabaseClientRef.current = createClient(env.supabaseUrl, env.supabaseAnonKey)
      }
      supabaseClientRef.current.auth.getSession().then(({ data: { session } }) => {
        sessionRef.current = session
        // Non-null assertion is safe here because there is a guard before this callback is registered.
        sessionReadyCallback({
          supabase: supabaseClientRef.current!,
          session: sessionRef.current,
        })
      })
    }
  }, [env, sessionReadyCallback, startedRetrieval])

  return (
    <Navbar expand="lg" className="navbar-dark" style={{ backgroundColor: '#000066', padding: 8 }}>
      <Navbar.Brand href="/" style={{ display: 'flex', alignItems: 'center', color: '#FFFFFF' }}>
        <Image
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          src={require('@/assets/images/main-call-image.jpeg')}
          alt="Logo"
          width={70}
          height={70}
          style={{ marginRight: 8 }}
        />
        Live Lawyer Web
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link as={Link} href={'/call'} style={{ color: '#FFFFFF' }}>
            Call
          </Nav.Link>
          <Nav.Link as={Link} href={'/account'} style={{ color: '#FFFFFF' }}>
            Account
          </Nav.Link>
          <Nav.Link as={Link} href={'/history'} style={{ color: '#FFFFFF' }}>
            History
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}
