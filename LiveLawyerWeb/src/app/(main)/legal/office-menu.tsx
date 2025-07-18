import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react'
import { useAlerter, useSession, useSupabaseClient } from 'livelawyerlibrary/context-manager'
import { Database } from 'livelawyerlibrary/database-types'
import OfficeEditor from './office-editor'
import OfficeSelector from './office-selector'
import CircularProgress from '@mui/material/CircularProgress'

export interface OfficeSubFormProps {
  currentOffice: Database['public']['Tables']['LawOffice']['Row'] | null | undefined
  setCurrentOffice: Dispatch<
    SetStateAction<Database['public']['Tables']['LawOffice']['Row'] | null | undefined>
  >
}

export default function OfficeMenu() {
  const alerterRef = useAlerter()
  const supabaseRef = useSupabaseClient()
  const sessionRef = useSession()

  const [currentOffice, setCurrentOffice] = useState<
    Database['public']['Tables']['LawOffice']['Row'] | null | undefined
  >(undefined)

  const fetchCurrentOffice = useCallback(async () => {
    const { data, error } = await supabaseRef.current
      .from('UserLawyer')
      .select('office:LawOffice(*)')
      .eq('id', sessionRef.current.user.id)
      .maybeSingle()
    if (error) {
      alerterRef.current.error(
        'Something went wrong when trying to fetch your office information! Try again later.',
      )
    } else if (data !== null && data.office !== null) {
      setCurrentOffice(data.office)
    } else {
      setCurrentOffice(null)
    }
  }, [alerterRef, sessionRef, supabaseRef])

  // Fetching the user's current office:
  useEffect(() => {
    if (currentOffice === undefined) {
      fetchCurrentOffice()
    }
  }, [currentOffice, fetchCurrentOffice])

  return (
    <>
      {currentOffice === undefined ? (
        <CircularProgress />
      ) : currentOffice !== null ? (
        <OfficeEditor currentOffice={currentOffice} setCurrentOffice={setCurrentOffice} />
      ) : (
        <OfficeSelector currentOffice={currentOffice} setCurrentOffice={setCurrentOffice} />
      )}
    </>
  )
}
