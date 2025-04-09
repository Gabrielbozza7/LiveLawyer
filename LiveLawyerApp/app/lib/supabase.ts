import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

/*
  Info for connecting to supabase DB, using anonymous key designed for public use.
  Needs to be changed to the main supabase URL and key instead of mine.
*/

const supabaseUrl = 'https://jalyamjykxebqsixdwoi.supabase.co'
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphbHlhbWp5a3hlYnFzaXhkd29pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MjY2MTEsImV4cCI6MjA1NzMwMjYxMX0.AScuXEU60mJtWAggEeq3HB-LzNDQPp16yj1h-yJbj5s'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
