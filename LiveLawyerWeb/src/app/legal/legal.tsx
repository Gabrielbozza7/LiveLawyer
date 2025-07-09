'use client'
import { useState } from 'react'
import OfficeMenu from './office-menu'
import StatesSelector from './states-selector'
import Stack from '@mui/material/Stack'
import Tabs from '@mui/material/Tabs'
import Container from '@mui/material/Container'
import CardContent from '@mui/material/CardContent'
import Card from '@mui/material/Card'
import Tab from '@mui/material/Tab'

const POSSIBLE_TABS = { StatesSelector: 'States', OfficeMenu: 'Office' } as const
type ActiveAccountTab = keyof typeof POSSIBLE_TABS

export default function Legal() {
  const [activeTab, setActiveTab] = useState<ActiveAccountTab>('StatesSelector')

  return (
    <Container maxWidth="lg" sx={{ marginTop: 4 }}>
      <Card variant="outlined" sx={{ padding: 1 }}>
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
              <StatesSelector />
            ) : activeTab === 'OfficeMenu' ? (
              <OfficeMenu />
            ) : (
              <></>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Container>
  )
}
