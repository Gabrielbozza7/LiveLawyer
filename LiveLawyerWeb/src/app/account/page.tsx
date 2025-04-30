'use client'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Button, Card, Container, Form } from 'react-bootstrap'
import LiveLawyerNav from '@/components/LiveLawyerNav'
import { useState } from 'react'

export default function AccountPage() {
  const [account, setAccount] = useState({
    name: 'Saul Goodman',
    email: 'Goodman@GoodmanLaw.com',
    phone: '123-456-7890',
    address: 'Goodman Law Office',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setAccount(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault()
    console.log('Updated Account Info:', account)
    alert('Changes saved (simulated)!')
  }

  return (
    <div>
      <title>Account</title>
      <LiveLawyerNav />
      <Container fluid="md" style={{ margin: 24 }}>
        <Card>
          <Card.Body>
            <h4 className="mb-4">Account Information</h4>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formName">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={account.name}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group controlId="formEmail" className="mt-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={account.email}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group controlId="formPhone" className="mt-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  value={account.phone}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group controlId="formAddress" className="mt-3">
                <Form.Label>Office</Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  value={account.address}
                  onChange={handleChange}
                />
              </Form.Group>

              <Button variant="primary" type="submit" className="mt-4">
                Save Changes
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  )
}
