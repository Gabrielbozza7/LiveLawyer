import { useAlerter, useSession, useSupabaseClient } from 'livelawyerlibrary/context-manager'
import { FormEvent, useCallback, useEffect, useState } from 'react'
import { Database } from 'livelawyerlibrary/database-types'
import { STATE_CODES_TO_NAMES } from 'livelawyerlibrary'
import Typography from '@mui/material/Typography'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import SearchIcon from '@mui/icons-material/Search'
import TextField from '@mui/material/TextField'
import Stack from '@mui/material/Stack'

function arraysEqual<T>(a1: T[], a2: T[]): boolean {
  return a1.length === a2.length && a1.every((value, index) => value === a2[index])
}

export default function StatesSelector() {
  const alerterRef = useAlerter()
  const supabaseRef = useSupabaseClient()
  const sessionRef = useSession()
  const [loading, setLoading] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')

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
      selectedStates.push(name as keyof typeof STATE_CODES_TO_NAMES)
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
    <>
      <Typography variant="body1">
        Select the states in which you are licensed to practice law.
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container columnSpacing={4} rowSpacing={4}>
          <Grid size={6}>
            <TextField
              fullWidth
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              label={
                <Stack direction="row" display="flex">
                  <SearchIcon />
                  <Typography variant="body1" sx={{ marginLeft: 0.5 }}>
                    Search states...
                  </Typography>
                </Stack>
              }
            />
          </Grid>
          <Grid size={6}>
            <Button
              fullWidth
              sx={{ display: 'flex', height: '100%' }}
              disabled={
                loading ||
                (prefilledStates !== undefined && arraysEqual(prefilledStates, selectedStates))
              }
              variant="contained"
              color="success"
              type="submit"
            >
              Save Changes
            </Button>
          </Grid>

          {Object.keys(STATE_CODES_TO_NAMES)
            .filter(
              stateCode =>
                STATE_CODES_TO_NAMES[stateCode as keyof typeof STATE_CODES_TO_NAMES]
                  .toLowerCase()
                  .indexOf(searchQuery) !== -1,
            )
            .map(stateCode => (
              <Grid key={stateCode} size={4}>
                <FormControlLabel
                  control={
                    <Switch
                      disabled={loading}
                      name={stateCode}
                      checked={selectedStates.find(x => stateCode === x) !== undefined}
                      onChange={handleChange}
                    />
                  }
                  label={STATE_CODES_TO_NAMES[stateCode as keyof typeof STATE_CODES_TO_NAMES]}
                />
              </Grid>
            ))}
        </Grid>
      </form>
    </>
  )
}
