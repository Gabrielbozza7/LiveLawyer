'use client'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Card, Container, ListGroup, Toast } from 'react-bootstrap'
import LiveLawyerNav, { SessionReadyCallbackArg } from '@/components/LiveLawyerNav'
import { PublicEnv } from '@/classes/PublicEnv'
import { useState } from 'react'
import LiveLawyerApi from 'livelawyerlibrary/api/LiveLawyerApi'
import { CallHistorySingle } from 'livelawyerlibrary/api/types/call-history'
import { HistoryEntry } from './history-entry'

export function History({ env }: { env: PublicEnv }) {
  const [api, setApi] = useState<LiveLawyerApi | undefined>(undefined)
  const [history, setHistory] = useState<CallHistorySingle[]>([])
  const [placeholder, setPlaceholder] = useState<string | undefined>('Loading...')
  const [showToast, setShowToast] = useState<string | null>(null)

  const sessionReadyCallback = async ({ session }: SessionReadyCallbackArg) => {
    // Fetching call history for the logged in user (if any):
    if (session !== null) {
      const api = new LiveLawyerApi(env.backendUrl, session.access_token)
      setApi(api)
      try {
        const response = await api.fetchCallHistory()
        if (response.history) {
          setHistory(response.history)
        }
      } catch (error) {
        console.log((error as Error).message)
        setShowToast('Something went wrong when trying to fetch your history! Try again later.')
        return
      }
      setPlaceholder(undefined)
    } else {
      setPlaceholder('You must be logged in to use this page.')
    }
  }

  return (
    <div>
      <title>History</title>
      <LiveLawyerNav env={env} sessionReadyCallback={sessionReadyCallback} />
      <Container fluid="md" style={{ margin: 24 }}>
        {placeholder !== undefined ? (
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
                    history.map((entry, index) => (
                      <ListGroup.Item key={index}>
                        <HistoryEntry entry={entry} api={api}></HistoryEntry>
                      </ListGroup.Item>
                    ))}
                </ListGroup>
              ) : (
                <Card.Text>Your call history is empty.</Card.Text>
              )}
            </Card.Body>
          </Card>
        )}
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
    </div>
  )
}
