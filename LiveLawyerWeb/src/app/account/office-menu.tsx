import { useCallback, useEffect, useState } from 'react'
import { AccountSubFormProps } from './account'
import { useSession, useSupabaseClient } from 'livelawyerlibrary/context-manager'
import { Database } from 'livelawyerlibrary/database-types'
import OfficeEditor from './office-editor'
import { Card } from 'react-bootstrap'
import OfficeSelector from './office-selector'

export default function OfficeMenu({ loading, setLoading, setStatusMessage }: AccountSubFormProps) {
  const supabaseRef = useSupabaseClient()
  const sessionRef = useSession()

  const [currentOffice, setCurrentOffice] = useState<
    Database['public']['Tables']['LawOffice']['Row'] | null | undefined
  >(undefined)

  const fetchCurrentOffice = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabaseRef.current
      .from('UserLawyer')
      .select('office:LawOffice(*)')
      .eq('id', sessionRef.current.user.id)
      .maybeSingle()
    if (error) {
      setStatusMessage(
        'Something went wrong when trying to fetch your office information! Try again later.',
      )
    } else if (data !== null && data.office !== null) {
      setCurrentOffice(data.office)
    } else {
      setCurrentOffice(null)
    }
    setLoading(false)
  }, [sessionRef, setLoading, setStatusMessage, supabaseRef])

  // Fetching the user's current office:
  useEffect(() => {
    if (currentOffice === undefined) {
      fetchCurrentOffice()
    }
  }, [currentOffice, fetchCurrentOffice])

  return (
    <>
      {currentOffice === undefined ? (
        <Card.Text>Loading...</Card.Text>
      ) : currentOffice !== null ? (
        <OfficeEditor
          loading={loading}
          setLoading={setLoading}
          setStatusMessage={setStatusMessage}
          currentOffice={currentOffice}
          setCurrentOffice={setCurrentOffice}
        />
      ) : (
        <OfficeSelector
          loading={loading}
          setLoading={setLoading}
          setStatusMessage={setStatusMessage}
          currentOffice={currentOffice}
          setCurrentOffice={setCurrentOffice}
        ></OfficeSelector>
      )}
    </>
  )
}
