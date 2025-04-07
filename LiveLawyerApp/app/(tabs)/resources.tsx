import { useState, useEffect } from 'react'
import { Styles } from '@/constants/Styles'
import { Text } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export default function Resources({ session }: { session: Session }) {
  const [accNum, setAccNum] = useState('')
  useEffect(() => {
    if (session) getProfile()
  }, [session])

  async function getProfile() {
    try {
      if (!session?.user) setAccNum('No Profile Found')

      const { data, error, status } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session?.user.id)
        .single()
      if (error && status !== 406) {
        throw error
      }
      if (data) {
        setAccNum(data.id)
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message)
      }
    }
  }
  return (
    <SafeAreaProvider>
      <SafeAreaView style={Styles.container}>
        <Text style={Styles.pageTitle}>Screen template!</Text>
        <Text>Account Number: {accNum}</Text>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
