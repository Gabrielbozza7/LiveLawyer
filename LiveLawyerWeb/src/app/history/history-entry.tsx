'use client'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Button, Card } from 'react-bootstrap'
import { useEffect, useState } from 'react'
import LiveLawyerApi from 'livelawyerlibrary/api/LiveLawyerApi'
import { CallHistorySingle } from 'livelawyerlibrary/api/types/call-history'

interface HistoryEntryProps {
  entry: CallHistorySingle
  api: LiveLawyerApi
}

export function HistoryEntry({ entry, api }: HistoryEntryProps) {
  const [showDetails, setShowDetails] = useState<boolean>(false)
  const [detailsText, setDetailsText] = useState<string | undefined>('Loading...')
  const [sentRequest, setSentRequest] = useState<boolean>(false)

  useEffect(() => {
    if (showDetails && !sentRequest) {
      setSentRequest(true)
      api
        .fetchCallDetails(entry.id)
        .then(details => {
          let s = 'EVENTS:\n'
          details.details.events.forEach(event => {
            s += JSON.stringify(event, undefined, '   ') + '\n'
          })
          s += 'RECORDINGS:\n'
          details.details.recordings.forEach(recording => {
            s += JSON.stringify(recording, undefined, '   ') + '\n'
          })
          setDetailsText(s)
        })
        .catch(error => {
          setDetailsText(`Something went wrong! (${(error as Error).message})`)
        })
    }
  }, [api, entry.id, sentRequest, showDetails])

  return (
    <div>
      <strong>Date/Time:</strong> {new Date(entry.startTime).toLocaleString()}
      <br />
      <strong>Client:</strong> {entry.clientName}
      <br />
      <strong>Paralegal:</strong> {entry.observerName}
      <br />
      <strong>Lawyer:</strong> {entry.lawyerName ?? <i>None</i>}
      <br />
      <strong>ID:</strong> {entry.id}
      <br></br>
      <Button onClick={() => setShowDetails(showDetails => !showDetails)}>
        {showDetails ? 'Hide Details' : 'Show Details'}
      </Button>
      {showDetails && (
        <Card>
          <Card.Body>
            <pre>{detailsText}</pre>
          </Card.Body>
        </Card>
      )}
    </div>
  )
}
