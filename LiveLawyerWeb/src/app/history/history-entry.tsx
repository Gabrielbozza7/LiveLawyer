'use client'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Button, Card, Table } from 'react-bootstrap'
import { useEffect, useState } from 'react'
import LiveLawyerApi from 'livelawyerlibrary/api/LiveLawyerApi'
import {
  CallHistoryDetailsSingle,
  CallHistorySingle,
} from 'livelawyerlibrary/api/types/call-history'

interface HistoryEntryProps {
  entry: CallHistorySingle
  api: LiveLawyerApi
}

export function HistoryEntry({ entry, api }: HistoryEntryProps) {
  const [showDetails, setShowDetails] = useState<boolean>(false)
  const [details, setDetails] = useState<CallHistoryDetailsSingle | undefined>(undefined)
  const [placeholder, setPlaceholder] = useState<string | undefined>('Loading...')
  const [sentRequest, setSentRequest] = useState<boolean>(false)

  useEffect(() => {
    if (showDetails && !sentRequest) {
      setSentRequest(true)
      api
        .fetchCallDetails(entry.id)
        .then(response => {
          setDetails(response.details)
          setPlaceholder(undefined)
        })
        .catch(error => {
          setPlaceholder(`Something went wrong! (${(error as Error).message})`)
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
            {placeholder !== undefined ? (
              <Card.Text>{placeholder}</Card.Text>
            ) : details !== undefined ? (
              <div>
                <Card.Text>
                  <strong>Call Events</strong>
                </Card.Text>
                {details.events.length > 0 ? (
                  <Table>
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>User</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.events.map((event, index) => (
                        <tr key={index}>
                          <td>{new Date(event.timestamp).toLocaleString()}</td>
                          <td>{event.userName}</td>
                          <td>{event.action}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <Card.Text>There are no events available.</Card.Text>
                )}
                <Card.Text>
                  <strong>Call Recordings</strong>
                </Card.Text>
                {details.recordings.length > 0 ? (
                  <Table>
                    <thead>
                      <tr>
                        <th>Start Timestamp</th>
                        <th>User</th>
                        <th>File Type</th>
                        <th>Download</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.recordings.map((recording, index) => (
                        <tr key={index}>
                          <td>{new Date(recording.startTime).toLocaleString()}</td>
                          <td>{recording.userName}</td>
                          <td>{recording.trackType}</td>
                          <td>
                            <Button href={recording.downloadLink}>Download</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <Card.Text>There are no recordings available.</Card.Text>
                )}
              </div>
            ) : (
              <Card.Text>Call details for this call are unavailable.</Card.Text>
            )}
          </Card.Body>
        </Card>
      )}
    </div>
  )
}
