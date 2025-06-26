'use client'
import { Card, Container } from 'react-bootstrap'
import { useState } from 'react'
import Editor from './editor'

export type ActiveForm = 'Editor'

export interface AccountSubFormProps {
  loading: boolean
  setLoading: (loading: boolean) => void
  setStatusMessage: (statusMessage: string) => void
}

export default function Account() {
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [activeForm] = useState<ActiveForm>('Editor')

  return (
    <>
      {statusMessage !== '' ? (
        <Container fluid="md" style={{ margin: 24 }}>
          <Card>
            <Card.Body>{statusMessage}</Card.Body>
          </Card>
        </Container>
      ) : (
        <Container fluid="md" style={{ margin: 24 }}>
          {activeForm === 'Editor' ? (
            <Editor loading={loading} setLoading={setLoading} setStatusMessage={setStatusMessage} />
          ) : (
            <></>
          )}
        </Container>
      )}
    </>
  )
}
