'use client'
import { Button, Card, Container, ListGroup } from 'react-bootstrap'
import { useCallback, useEffect, useState } from 'react'
import { CallHistorySingle } from 'livelawyerlibrary/api/types/call-history'
import { HistoryEntry } from './history-entry'
import { useAlerter, useApi } from 'livelawyerlibrary/context-manager'

export function History() {
  const alerterRef = useAlerter()
  const apiRef = useApi()
  const [history, setHistory] = useState<CallHistorySingle[] | undefined>(undefined)
  const [placeholder, setPlaceholder] = useState<string | null>('Loading...')

  const refreshHistory = useCallback(async () => {
    try {
      const response = await apiRef.current.fetchCallHistory()
      if (response.history) {
        setHistory(response.history)
      }
    } catch (error) {
      console.log((error as Error).message)
      alerterRef.current.error(
        'Something went wrong when trying to fetch your history! Try again later.',
      )
    }
    setPlaceholder(null)
  }, [alerterRef, apiRef])

  useEffect(() => {
    refreshHistory()
  }, [refreshHistory])

  return (
    <Container fluid="md" style={{ margin: 24 }}>
      {placeholder !== null ? (
        <Card>
          <Card.Body>{placeholder}</Card.Body>
        </Card>
      ) : (
        <Card>
          <Card.Body>
            <h4 className="mb-3">Call History</h4>
            {history === undefined ? (
              <Card.Text>Your call history could not be loaded.</Card.Text>
            ) : history.length > 0 ? (
              <ListGroup>
                {history.map(entry => (
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
    </Container>
  )
}
