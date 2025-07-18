import General from '@/components/account/general'
import Sensitive from '@/components/account/sensitive'
import { FabWithConfirmation } from '@/components/ui/fab-with-confirmation'
import { StandalonePage } from '@/components/ui/standalone-page'
import { newStyles } from '@/constants/Styles'
import { useAlerter, useSupabaseClient } from 'livelawyerlibrary/context-manager'
import { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SegmentedButtons } from 'react-native-paper'

type ActiveTab = 'General' | 'Sensitive'

export default function LoginRegister() {
  const supabaseRef = useSupabaseClient()
  const alerterRef = useAlerter()
  const [activeTab, setActiveTab] = useState<ActiveTab>('General')

  const handleLogout = async () => {
    try {
      await supabaseRef.current.auth.signOut()
    } catch {
      alerterRef.current.error('Something went wrong when trying to log out! Try again later.')
    }
  }

  return (
    <StandalonePage title="Account Information">
      <ScrollView>
        <SegmentedButtons
          value={activeTab}
          onValueChange={setActiveTab}
          buttons={[
            {
              value: 'General',
              label: 'General',
            },
            {
              value: 'Sensitive',
              label: 'Sensitive',
            },
          ]}
          density="small"
          style={newStyles.tabs}
        />
        <View style={activeTab !== 'General' && styles.inactiveTab}>
          <General />
        </View>
        <View style={activeTab !== 'Sensitive' && styles.inactiveTab}>
          <Sensitive />
        </View>
      </ScrollView>
      <FabWithConfirmation
        icon="logout"
        prompt="Logout?"
        onConfirm={handleLogout}
        animateFrom="right"
        style={newStyles.bottomRightFab}
      />
    </StandalonePage>
  )
}

const styles = StyleSheet.create({
  inactiveTab: { display: 'none' },
})
