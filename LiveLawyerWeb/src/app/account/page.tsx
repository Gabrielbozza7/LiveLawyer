'use client'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Card, Container } from 'react-bootstrap'
import LiveLawyerNav from '@/components/LiveLawyerNav'

export default function Call() {
  return (
    <div>
      <title>Account</title>
      <LiveLawyerNav />
      <Container fluid="md" style={{ margin: 24 }}>
        <Card>
          <Card.Body>
            <Card.Text>Account page!</Card.Text>
          </Card.Body>
        </Card>
      </Container>
    </div>
  )
}
