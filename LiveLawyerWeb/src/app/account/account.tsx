'use client'
import { Button, Card, Container } from 'react-bootstrap'
import { Dispatch, SetStateAction, useState } from 'react'
import UserEditor from './user-editor'
import { useUserType } from 'livelawyerlibrary/context-manager'
import OfficeMenu from './office-menu'
import { Database } from 'livelawyerlibrary/database-types'

export type ActiveForm = 'UserEditor' | 'OfficeMenu'

export interface AccountSubFormProps {
  loading: boolean
  setLoading: Dispatch<SetStateAction<boolean>>
  setStatusMessage: (statusMessage: string) => void
}

export interface AccountOfficeSubFormProps {
  currentOffice: Database['public']['Tables']['LawOffice']['Row'] | null | undefined
  setCurrentOffice: Dispatch<
    SetStateAction<Database['public']['Tables']['LawOffice']['Row'] | null | undefined>
  >
}

export default function Account() {
  const userType = useUserType()
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [activeForm, setActiveForm] = useState<ActiveForm>('UserEditor')

  return (
    <>
      {statusMessage !== '' ? (
        <Container fluid="md" style={{ margin: 24 }}>
          <Card>
            <Card.Body>{statusMessage}</Card.Body>
          </Card>
        </Container>
      ) : (
        <>
          <Container fluid="md" style={{ margin: 24 }}>
            <Button variant="primary" onClick={() => setActiveForm('UserEditor')} className="mt-3">
              User
            </Button>
            {userType === 'Lawyer' && (
              <Button
                variant="primary"
                onClick={() => setActiveForm('OfficeMenu')}
                className="mt-3"
              >
                Office
              </Button>
            )}
            {activeForm === 'UserEditor' ? (
              <UserEditor
                loading={loading}
                setLoading={setLoading}
                setStatusMessage={setStatusMessage}
              />
            ) : activeForm === 'OfficeMenu' ? (
              <OfficeMenu
                loading={loading}
                setLoading={setLoading}
                setStatusMessage={setStatusMessage}
              />
            ) : (
              <></>
            )}
          </Container>
        </>
      )}
    </>
  )
}
