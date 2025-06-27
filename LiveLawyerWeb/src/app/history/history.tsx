'use client'
import { Button, Card, Container, ListGroup, Toast } from 'react-bootstrap'
import { useCallback, useEffect, useState } from 'react'
import { CallHistorySingle } from 'livelawyerlibrary/api/types/call-history'
import { HistoryEntry } from './history-entry'
import { useSessionData } from '@/components/ContextManager'

export function History() {
  const { api } = useSessionData()
  const [history, setHistory] = useState<CallHistorySingle[]>([])
  const [placeholder, setPlaceholder] = useState<string | null>('Loading...')
  const [showToast, setShowToast] = useState<string | null>(null)

  const refreshHistory = useCallback(async () => {
    try {
      const response = await api.fetchCallHistory()
      if (response.history) {
        setHistory(response.history)
      }
    } catch (error) {
      console.log((error as Error).message)
      setPlaceholder('Something went wrong when trying to fetch your history! Try again later.')
      return
    }
    setPlaceholder(null)
  }, [api])

  useEffect(() => {
    refreshHistory()
  }, [refreshHistory])

  return (
    <>
      <title>History</title>
      <Container fluid="md" style={{ margin: 24 }}>
        {placeholder !== null ? (
          <Card>
            <Card.Body>{placeholder}</Card.Body>
          </Card>
        ) : (
          <Card>
            <Card.Body>
              <h4 className="mb-3">Call History</h4>
              {history.length > 0 ? (
                <ListGroup>
                  {api !== undefined &&
                    history.map(entry => (
                      <ListGroup.Item key={entry.id}>
                        <HistoryEntry entry={entry}></HistoryEntry>
                      </ListGroup.Item>
                    ))}
                </ListGroup>
              ) : (
                <Card.Text>Your call history is empty.</Card.Text>
              )}
            </Card.Body>
          </Card>
        )}
        <Button onClick={refreshHistory}>Refresh</Button>
        <Toast
          bg="danger"
          onClose={() => setShowToast(null)}
          show={showToast !== null}
          delay={2500}
          autohide
        >
          <Toast.Header>
            <strong className="me-auto">Error</strong>
          </Toast.Header>
          <Toast.Body>{showToast}</Toast.Body>
        </Toast>
      </Container>
    </>
  )
}
