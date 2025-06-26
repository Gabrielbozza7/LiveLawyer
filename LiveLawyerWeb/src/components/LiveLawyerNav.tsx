'use client'
import Link from 'next/link'
import { Nav, Navbar } from 'react-bootstrap'
import Image from 'next/image'

export default function LiveLawyerNav() {
  return (
    <Navbar expand="lg" className="navbar-dark" style={{ backgroundColor: '#000066', padding: 8 }}>
      <Navbar.Brand href="/" style={{ display: 'flex', alignItems: 'center', color: '#FFFFFF' }}>
        <Image
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          src={require('@/assets/images/main-call-image.jpeg')}
          alt="Logo"
          width={70}
          height={70}
          style={{ marginRight: 8 }}
        />
        Live Lawyer Web
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link as={Link} href={'/call'} style={{ color: '#FFFFFF' }}>
            Call
          </Nav.Link>
          <Nav.Link as={Link} href={'/account'} style={{ color: '#FFFFFF' }}>
            Account
          </Nav.Link>
          <Nav.Link as={Link} href={'/history'} style={{ color: '#FFFFFF' }}>
            History
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}
