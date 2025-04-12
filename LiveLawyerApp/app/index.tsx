import { useEffect } from 'react'
import { useRouter } from 'expo-router'
import { supabase } from './lib/supabase'

export default function Index() {
  const router = useRouter()
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        console.log(`Session found: ${session}`)
        router.replace(`./(tabs)/index`)
      } else {
        console.log(`Session not found.`)
        router.replace(`./auth/login`)
      }
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace(`./(tabs)/index`)
      } else {
        router.replace(`./auth/login`)
      }
    })
  }, [])
}
