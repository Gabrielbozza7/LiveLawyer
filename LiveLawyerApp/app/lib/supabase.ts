import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

//Info for connecting to supabase DB, using anonymous key designed for public use.
const supabaseUrl = 'https://hgnkyoaoezolwihgkndj.supabase.co'
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhnbmt5b2FvZXpvbHdpaGdrbmRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5NzM3NTQsImV4cCI6MjA1NzU0OTc1NH0._0DBAC7DU5s7ivvsJIUt5M-ySbEG7i1CDLuAn5kbXBQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
