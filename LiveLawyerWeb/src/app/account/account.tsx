'use client'
import { Dispatch, SetStateAction, useState } from 'react'
import UserEditor from './user-editor'
import { useUserType } from 'livelawyerlibrary/context-manager'
import OfficeMenu from './office-menu'
import { Database } from 'livelawyerlibrary/database-types'
import StatesSelector from './states-selector'
import Stack from '@mui/material/Stack'
import Tabs from '@mui/material/Tabs'
import Container from '@mui/material/Container'
import CardContent from '@mui/material/CardContent'
import Card from '@mui/material/Card'
import Tab from '@mui/material/Tab'
import Typography from '@mui/material/Typography'

const POSSIBLE_TABS = ['UserEditor', 'StatesSelector', 'OfficeMenu'] as const
type ActiveAccountTab = (typeof POSSIBLE_TABS)[number]

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
  const [activeTab, setActiveTab] = useState<ActiveAccountTab>('UserEditor')

  return (
    <Container maxWidth="lg" sx={{ marginTop: 4 }}>
      <Card variant="outlined" sx={{ padding: 1 }}>
        {statusMessage !== '' ? (
          <CardContent>
            <Typography variant="body1">{statusMessage}</Typography>
          </CardContent>
        ) : (
          <CardContent>
            <Stack spacing={4}>
              <Tabs
                value={POSSIBLE_TABS.findIndex(x => x === activeTab)}
                onChange={(event, index) => setActiveTab(POSSIBLE_TABS[index])}
              >
                <Tab label="User" />
                {userType === 'Lawyer' && <Tab label="States" />}
                {userType === 'Lawyer' && <Tab label="Office" />}
              </Tabs>
              {activeTab === 'UserEditor' ? (
                <UserEditor
                  loading={loading}
                  setLoading={setLoading}
                  setStatusMessage={setStatusMessage}
                />
              ) : activeTab === 'StatesSelector' ? (
                <StatesSelector
                  loading={loading}
                  setLoading={setLoading}
                  setStatusMessage={setStatusMessage}
                />
              ) : activeTab === 'OfficeMenu' ? (
                <OfficeMenu
                  loading={loading}
                  setLoading={setLoading}
                  setStatusMessage={setStatusMessage}
                />
              ) : (
                <></>
              )}
            </Stack>
          </CardContent>
        )}
      </Card>
    </Container>
  )
}
