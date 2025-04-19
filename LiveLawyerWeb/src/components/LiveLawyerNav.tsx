import Link from 'next/link'
import { Nav, Navbar } from 'react-bootstrap'

export default function LiveLawyerNav() {
  return (
    <Navbar bg="danger" expand="lg" style={{ padding: 8 }}>
      <Navbar.Brand href="/">Live Lawyer Web</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link as={Link} href={'/call'}>
            Call
          </Nav.Link>
          <Nav.Link as={Link} href={'/account'}>
            Account
          </Nav.Link>
          <Nav.Link as={Link} href={'/history'}>
            History
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}
