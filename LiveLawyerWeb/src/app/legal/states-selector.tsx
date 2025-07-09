import { useAlerter, useSession, useSupabaseClient } from 'livelawyerlibrary/context-manager'
import { FormEvent, useCallback, useEffect, useState } from 'react'
import { Database } from 'livelawyerlibrary/database-types'
import { Button, Card, Form } from 'react-bootstrap'
import { stateCodesToNames } from 'livelawyerlibrary'

function arraysEqual<T>(a1: T[], a2: T[]): boolean {
  if (a1.length !== a2.length) {
    return false
  }
  return a1.every((value, index) => value === a2[index])
}

export default function StatesSelector() {
  const alerterRef = useAlerter()
  const supabaseRef = useSupabaseClient()
  const sessionRef = useSession()
  const [loading, setLoading] = useState<boolean>(false)

  const [prefilledStates, setPrefilledStates] = useState<
    Database['public']['Enums']['UsState'][] | undefined
  >(undefined)
  const [selectedStates, setSelectedStates] = useState<Database['public']['Enums']['UsState'][]>([])

  const prefillForm = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabaseRef.current
      .from('UserLawyer')
      .select()
      .eq('id', sessionRef.current.user.id)
      .single()
    if (error || data === null) {
      alerterRef.current.error(
        "Something went wrong when trying to fetch your account information, so the form couldn't be prefilled!",
      )
      setPrefilledStates(undefined)
    } else {
      const states = data.licensedStates.sort()
      setPrefilledStates(states)
      setSelectedStates([...states])
    }
    setLoading(false)
  }, [alerterRef, sessionRef, setLoading, supabaseRef])

  // Filling the form with the lawyers's existing states data before presenting it for editing:
  useEffect(() => {
    prefillForm()
  }, [prefillForm])

  // Dynamically syncing the form changes to the states model:
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    if (checked) {
      selectedStates.push(name as keyof typeof stateCodesToNames)
      selectedStates.sort()
    } else {
      selectedStates.splice(
        selectedStates.findIndex(value => value === name),
        1,
      )
    }
    setSelectedStates([...selectedStates])
  }

  // Updating the database based on the new account model when the form is submitted:
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    // Updating profile:
    const { error: updateError } = await supabaseRef.current
      .from('UserLawyer')
      .update({
        licensedStates: selectedStates,
      })
      .eq('id', sessionRef.current.user.id)
      .single()
    if (updateError) {
      alerterRef.current.error(
        'Something went wrong when trying to update your licensed states! Try again.',
      )
    } else {
      setPrefilledStates([...selectedStates])
      alerterRef.current.success('Update successful!')
    }
    setLoading(false)
  }

  return (
    <Card>
      <Card.Body>
        <h4 className="mb-4">Licensed States</h4>
        <Form onSubmit={handleSubmit}>
          <Card.Text className="mt-3">
            Select the states in which you are licensed to practice law.
          </Card.Text>

          {Object.keys(stateCodesToNames).map(stateCode => (
            <Form.Group key={stateCode} controlId={`state${stateCode}`} className="mt-3">
              <Form.Check
                disabled={loading}
                type="switch"
                name={stateCode}
                label={stateCodesToNames[stateCode as keyof typeof stateCodesToNames]}
                checked={selectedStates.find(x => stateCode === x) !== undefined}
                onChange={handleChange}
              />
            </Form.Group>
          ))}

          <Button
            disabled={
              loading ||
              (prefilledStates !== undefined && arraysEqual(prefilledStates, selectedStates))
            }
            variant="primary"
            type="submit"
            className="mt-3"
          >
            Save Changes
          </Button>
        </Form>
      </Card.Body>
    </Card>
  )
}
