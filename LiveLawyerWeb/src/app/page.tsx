'use client'
import 'bootstrap/dist/css/bootstrap.min.css'
import LiveLawyerNav from '@/components/LiveLawyerNav'
import { Card, Container } from 'react-bootstrap'
import Image from 'next/image'
import mainCallImage from '@/assets/images/main-call-image.jpeg'

export default function App() {
  return (
    <div>
      <title>Live Lawyer Web</title>
      <LiveLawyerNav />
      <Container fluid="md" style={{ margin: 24 }}>
        <Card>
          <Card.Header>Live Lawyer Web</Card.Header>
          <Card.Body>
            <Card.Title>This is the base page.</Card.Title>
            <Image src={mainCallImage} alt="Main Call" layout="intrinsic" />

            <Card.Text>Yeah.</Card.Text>
          </Card.Body>
        </Card>
      </Container>
    </div>
  )
}
