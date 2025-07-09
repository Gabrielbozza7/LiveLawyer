'use client'
import { Dispatch, SetStateAction, useState } from 'react'
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

const POSSIBLE_TABS = { StatesSelector: 'States', OfficeMenu: 'Office' } as const
type ActiveAccountTab = keyof typeof POSSIBLE_TABS

export interface LegalSubFormProps {
  loading: boolean
  setLoading: Dispatch<SetStateAction<boolean>>
  setStatusMessage: (statusMessage: string) => void
}

export interface OfficeSubFormProps {
  currentOffice: Database['public']['Tables']['LawOffice']['Row'] | null | undefined
  setCurrentOffice: Dispatch<
    SetStateAction<Database['public']['Tables']['LawOffice']['Row'] | null | undefined>
  >
}

export default function Legal() {
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState<ActiveAccountTab>('StatesSelector')

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
                value={Object.keys(POSSIBLE_TABS).findIndex(x => x === activeTab)}
                onChange={(event, index) =>
                  setActiveTab(Object.entries(POSSIBLE_TABS)[index][0] as ActiveAccountTab)
                }
              >
                {Array.from(Object.entries(POSSIBLE_TABS)).map(tab => (
                  <Tab key={tab[0]} label={tab[1]} />
                ))}
              </Tabs>
              {activeTab === 'StatesSelector' ? (
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
