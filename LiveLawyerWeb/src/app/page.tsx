'use client'
import 'bootstrap/dist/css/bootstrap.min.css'
import LiveLawyerNav from '@/components/LiveLawyerNav'
import { Card, Container, Button } from 'react-bootstrap'
import { useRouter } from 'next/navigation'

export default function App() {
  const router = useRouter()

  const goToCallPage = () => {
    router.push('/call')
  }

  return (
    <div>
      <title>Live Lawyer Web</title>
      <LiveLawyerNav />
      <Container fluid="md" style={{ backgroundColor: '#e6e6e6', margin: 24 }}>
        <Card>
          <Card.Header>Live Lawyer Web</Card.Header>
          <Card.Body>
            <Card.Title>Welcome to Live Lawyer App.</Card.Title>
            <Card.Text>
              To start your call with a client in the call page click if you are a paralegal or a
              lawyer.
            </Card.Text>
            <Button variant="primary" onClick={goToCallPage}>
              Go to Call Page
            </Button>
          </Card.Body>
        </Card>
      </Container>
    </div>
  )
}
