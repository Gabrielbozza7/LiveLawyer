'use client'
import 'bootstrap/dist/css/bootstrap.min.css'
import LiveLawyerNav from '@/components/LiveLawyerNav'
import { Card, Container } from 'react-bootstrap'

export default function App() {
  return (
    <div>
      <title>Live Lawyer Web</title>
      <LiveLawyerNav />
      <Container fluid="md" style={{ backgroundColor: '#e6e6e6', margin: 24 }}>
        <Card>
          <Card.Header>Live Lawyer Web</Card.Header>
          <Card.Body>
            <Card.Title>This is the base page.</Card.Title>
            <Card.Text>Yeah.</Card.Text>
          </Card.Body>
        </Card>
      </Container>
    </div>
  )
}
