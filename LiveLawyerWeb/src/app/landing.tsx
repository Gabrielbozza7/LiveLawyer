'use client'
import { useRouter } from 'next/navigation'
import { Card, Container, Button } from 'react-bootstrap'

export default function Landing() {
  const router = useRouter()

  return (
    <>
      <title>Live Lawyer Web</title>
      <Container fluid="md" style={{ backgroundColor: '#e6e6e6', margin: 24 }}>
        <Card>
          <Card.Header>Live Lawyer Web</Card.Header>
          <Card.Body>
            <Card.Title>Welcome to Live Lawyer App.</Card.Title>
            <Card.Text>
              To start your call with a client in the call page, click if you are an observer or a
              lawyer.
            </Card.Text>
            <Button variant="primary" onClick={() => router.push('/call')}>
              Go to Call Page
            </Button>
          </Card.Body>
        </Card>
      </Container>
    </>
  )
}
