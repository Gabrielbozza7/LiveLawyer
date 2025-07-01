import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Card, Form } from 'react-bootstrap'
import { useSupabaseClient } from 'livelawyerlibrary/context-manager'

export interface OfficeOption {
  id: string
  name: string
}

export interface OfficeSelection {
  newOfficeName: string
  selectedOfficeId?: string
}

interface OfficeSelectorProps {
  loading: boolean
  currentOffice: OfficeOption | undefined
  setSelection: Dispatch<SetStateAction<OfficeSelection | undefined>>
}

export default function OfficeSelector({
  loading,
  currentOffice,
  setSelection,
}: OfficeSelectorProps) {
  const supabaseRef = useSupabaseClient()
  const [placeholder, setPlaceholder] = useState<string>('Loading...')
  const [offices, setOffices] = useState<OfficeOption[]>([])
  const [selectionType, setSelectionType] = useState<'Existing Office' | 'New Office'>(
    'Existing Office',
  )
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
          if (currentOffice === undefined) {
            setSelectedOfficeIndex(0)
            setSelection({
              selectedOfficeId: formattedOffices[0].id,
              newOfficeName: formattedOffices[0].name,
            })
          } else {
            setSelectedOfficeIndex(
              Math.max(
                formattedOffices.findIndex(value => currentOffice.id === value.id),
                0,
              ),
            )
            setSelection({ selectedOfficeId: currentOffice.id, newOfficeName: currentOffice.name })
          }
        } else {
          setSelectionType('New Office')
          setSelection({ newOfficeName: '' })
        }
        setPlaceholder('')
      }
    })()
  }, [currentOffice, setSelection, supabaseRef])

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

  return (
    <Card>
      <Card.Body>
        {placeholder !== '' ? (
          <Card.Text className="mt-3">{placeholder}</Card.Text>
        ) : (
          <div>
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
              <div>
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
                <Card.Text className="mt-3">Office ID: {offices[selectedOfficeIndex].id}</Card.Text>
              </div>
            ) : (
              <div>
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
              </div>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  )
}
