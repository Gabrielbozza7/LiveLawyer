'use client'
import { Button, Container } from 'react-bootstrap'
import { useState } from 'react'
import Login from './Login'
import Register from './Register'

export type ActiveSessionlessForm = 'Login' | 'Register'

export default function SessionlessMenu() {
  const [activeForm, setActiveForm] = useState<ActiveSessionlessForm>('Login')

  return (
    <>
      <title>Login/Register</title>
      <Container fluid="md" style={{ margin: 24 }}>
        <Button
          variant="primary"
          onClick={() => {
            setActiveForm('Login')
          }}
          className="mt-3"
        >
          Login
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            setActiveForm('Register')
          }}
          className="mt-3"
        >
          Register
        </Button>
        {activeForm === 'Login' ? <Login /> : activeForm === 'Register' ? <Register /> : <></>}
      </Container>
    </>
  )
}
