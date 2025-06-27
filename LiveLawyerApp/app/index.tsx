import { useEffect } from 'react'
import { useRouter } from 'expo-router'

export default function Index() {
  const router = useRouter()

  useEffect(() => {
    ;(async () => {
      await new Promise(resolve => setTimeout(resolve, 3000))
      router.replace('/(tabs)')
    })()
  }, [])
}
