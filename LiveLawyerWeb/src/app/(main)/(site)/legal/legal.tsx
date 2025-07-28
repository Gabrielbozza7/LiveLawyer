'use client'
import { useState } from 'react'
import OfficeMenu from './office-menu'
import StatesSelector from './states-selector'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { PageContent } from '@/components/ui/page-content'

const POSSIBLE_TABS = {
  StatesSelector: ['States', 'Licensed States'],
  OfficeMenu: ['Office', 'Office Configuration'],
} as const
type ActiveTab = keyof typeof POSSIBLE_TABS

export default function Legal() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('StatesSelector')
  const currentTabIndex = Object.keys(POSSIBLE_TABS).findIndex(x => x === activeTab)

  return (
    <PageContent
      title={Object.entries(POSSIBLE_TABS)[currentTabIndex][1][1]}
      aboveTitle={
        <Tabs
          value={currentTabIndex}
          onChange={(event, index) =>
            setActiveTab(Object.entries(POSSIBLE_TABS)[index][0] as ActiveTab)
          }
        >
          {Array.from(Object.entries(POSSIBLE_TABS)).map(tab => (
            <Tab key={tab[0]} label={tab[1][0]} />
          ))}
        </Tabs>
      }
    >
      {activeTab === 'StatesSelector' ? (
        <StatesSelector />
      ) : activeTab === 'OfficeMenu' ? (
        <OfficeMenu />
      ) : (
        <></>
      )}
    </PageContent>
  )
}
