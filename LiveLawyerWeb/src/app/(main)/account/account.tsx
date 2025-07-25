'use client'
import { useState } from 'react'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { PageContent } from '@/components/ui/page-content'
import General from './general'
import Settings from './settings'

const POSSIBLE_TABS = {
  General: 'Profile Data',
  Settings: 'Sensitive Account Data',
} as const
type ActiveTab = keyof typeof POSSIBLE_TABS

export default function Legal() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('General')
  const currentTabIndex = Object.keys(POSSIBLE_TABS).findIndex(x => x === activeTab)

  return (
    <PageContent
      title={Object.entries(POSSIBLE_TABS)[currentTabIndex][1]}
      aboveTitle={
        <Tabs
          value={currentTabIndex}
          onChange={(event, index) =>
            setActiveTab(Object.entries(POSSIBLE_TABS)[index][0] as ActiveTab)
          }
        >
          {Array.from(Object.entries(POSSIBLE_TABS)).map(tab => (
            <Tab key={tab[0]} label={tab[0]} />
          ))}
        </Tabs>
      }
    >
      {activeTab === 'General' ? <General /> : activeTab === 'Settings' ? <Settings /> : <></>}
    </PageContent>
  )
}
