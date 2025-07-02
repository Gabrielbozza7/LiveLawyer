import React, { FormEvent, useEffect, useState } from 'react'
import { Button, Card, Form } from 'react-bootstrap'
import { useSession, useSupabaseClient } from 'livelawyerlibrary/context-manager'
import { PostgrestError } from '@supabase/supabase-js'
import { AccountOfficeSubFormProps, AccountSubFormProps } from './account'

export interface OfficeOption {
  id: string
  name: string
}

export interface OfficeSelection {
  newOfficeName: string
  selectedOfficeId?: string
}

export default function OfficeSelector({
  loading,
  setLoading,
  setStatusMessage,
  setCurrentOffice,
}: AccountSubFormProps & AccountOfficeSubFormProps) {
  const supabaseRef = useSupabaseClient()
  const sessionRef = useSession()
  const [placeholder, setPlaceholder] = useState<string | null>('Loading...')
  const [offices, setOffices] = useState<OfficeOption[]>([])
  const [selectionType, setSelectionType] = useState<'Existing Office' | 'New Office'>(
    'Existing Office',
  )
  const [selection, setSelection] = useState<OfficeSelection | undefined>(undefined)
  const [selectedOfficeIndex, setSelectedOfficeIndex] = useState<number>(0)
  const [newOfficeName, setNewOfficeName] = useState<string>('')

  // Fetching the existing offices:
  useEffect(() => {
    ;(async () => {
      const { data, error } = await supabaseRef.current.from('LawOffice').select()
      if (error || data === null) {
        setPlaceholder('Unable to find law offices right now! Try again later')
      } else {
        const formattedOffices = data.map(office => {
          return { id: office.id, name: office.name }
        })
        setOffices(formattedOffices)
        if (formattedOffices.length > 0) {
          setSelectedOfficeIndex(0)
          setSelection({
            selectedOfficeId: formattedOffices[0].id,
            newOfficeName: formattedOffices[0].name,
          })
        } else {
          setSelectionType('New Office')
          setSelection({ newOfficeName: '' })
        }
        setPlaceholder(null)
      }
    })()
  }, [supabaseRef])

  // Dynamically syncing the form changes to the account model:
  const handleChangeSelectionType = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target
    setSelectionType(value as 'Existing Office' | 'New Office')
  }

  const handleChangeSelectedOffice = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target
    const index = Number(value)
    const office = offices[index]
    setSelectedOfficeIndex(index)
    setSelection({ selectedOfficeId: office.id, newOfficeName: office.name })
  }

  const handleChangeNewOfficeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setNewOfficeName(value)
    setSelection({ newOfficeName: value })
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (selection === undefined) return
    setLoading(true)
    // Creating law office and updating lawyer profile if specified:
    if (selection.selectedOfficeId === undefined) {
      const { data, error: insertError } = await supabaseRef.current
        .from('LawOffice')
        .insert({
          administratorId: sessionRef.current.user.id,
          name: selection.newOfficeName,
        })
        .select()
        .single()
      let upsertError: PostgrestError | null = null
      if (data !== null) {
        // Updating lawyer profile:
        const { error: upsertInnerError } = await supabaseRef.current
          .from('UserLawyer')
          .upsert({ id: sessionRef.current.user.id, officeId: data.id }, { onConflict: 'id' })
          .single()
        upsertError = upsertInnerError
      }
      if (insertError || upsertError) {
        setStatusMessage(
          'Something went wrong when trying to create the new office! Try again later.',
        )
      }
    } else if (selection.selectedOfficeId !== undefined) {
      // Updating lawyer profile to existing law office if specified:
      const { error: upsertError } = await supabaseRef.current
        .from('UserLawyer')
        .upsert(
          { id: sessionRef.current.user.id, officeId: selection.selectedOfficeId },
          { onConflict: 'id' },
        )
        .single()
      if (upsertError) {
        setStatusMessage(
          'Something went wrong when trying to add you to the office! Try again later.',
        )
      }
    }
    setLoading(false)
    setCurrentOffice(undefined)
  }

  return (
    <Card>
      <Card.Body>
        {placeholder !== null ? (
          <Card.Text className="mt-3">{placeholder}</Card.Text>
        ) : (
          <>
            <h4 className="mb-4">Join/Create Office</h4>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formSelectionType" className="mt-3">
                <Form.Select
                  disabled={loading}
                  name="userType"
                  value={selectionType}
                  onChange={handleChangeSelectionType}
                >
                  <option value={'Existing Office'}>Existing Office</option>
                  <option value={'New Office'}>New Office</option>
                </Form.Select>
              </Form.Group>

              {selectionType === 'Existing Office' ? (
                <>
                  <Form.Group controlId="formUserType" className="mt-3">
                    <Form.Label>Existing Office Name</Form.Label>
                    <Form.Select
                      disabled={loading}
                      name="selectedOfficeId"
                      value={selectedOfficeIndex}
                      onChange={handleChangeSelectedOffice}
                    >
                      {offices.map((office, index) => (
                        <option key={index} value={index}>
                          {office.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Card.Text className="mt-3">
                    Office ID: {offices[selectedOfficeIndex].id}
                  </Card.Text>
                </>
              ) : (
                <Form.Group controlId="formNewOfficeName" className="mt-3">
                  <Form.Label>New Office Name</Form.Label>
                  <Form.Control
                    disabled={loading}
                    type="text"
                    name="newOfficeName"
                    value={newOfficeName}
                    onChange={handleChangeNewOfficeName}
                  />
                </Form.Group>
              )}

              <Button disabled={loading} variant="primary" type="submit">
                {selection?.selectedOfficeId === undefined ? 'Create' : 'Join'}
              </Button>
            </Form>
          </>
        )}
      </Card.Body>
    </Card>
  )
}
