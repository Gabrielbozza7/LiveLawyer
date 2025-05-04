'use client'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Card, Container, ListGroup } from 'react-bootstrap'
import LiveLawyerNav from '@/components/LiveLawyerNav'

export default function History() {
  const mockCallHistory = [
    {
      id: 1,
      lawyer: 'Green Man',
      date: '2025-04-20',
      time: '3:00 PM',
      duration: '30 min',
      status: 'Completed',
    },
    {
      id: 2,
      lawyer: 'John Doe',
      date: '2025-04-18',
      time: '11:00 AM',
      duration: '45 min',
      status: 'Missed',
    },
    {
      id: 3,
      lawyer: 'Peter Griffen',
      date: '2025-04-15',
      time: '2:30 PM',
      duration: '20 min',
      status: 'Completed',
    },
  ]

  return (
    <div>
      <title>Call History</title>
      <LiveLawyerNav />
      <Container fluid="md" style={{ margin: 24 }}>
        <Card>
          <Card.Body>
            <h4 className="mb-3">Call History</h4>
            <ListGroup>
              {mockCallHistory.map(call => (
                <ListGroup.Item key={call.id}>
                  <strong>{call.lawyer}</strong> – {call.date} at {call.time} <br />
                  Duration: {call.duration} | Status: {call.status}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card.Body>
        </Card>
      </Container>
    </div>
  )
}
