import React, { useEffect, useState } from 'react'
import { useAlerter, useSession, useSupabaseClient } from 'livelawyerlibrary/context-manager'
import { OfficeSubFormProps } from './office-menu'
import ValidatedAutocompleteDropdown, {
  AutocompleteOption,
  AutocompleteOptionNotNew,
} from '@/components/forms/validated-autocomplete-dropdown'
import Typography from '@mui/material/Typography'
import BusinessIcon from '@mui/icons-material/Business'
import { notEmpty } from 'livelawyerlibrary/input-validation'
import { ValidatedForm } from 'livelawyerlibrary/forms/validated-form'
import { ValidatedFormSubmitButton } from 'livelawyerlibrary/forms/validated-form-submit-button'

export interface OfficeOptionExtra {
  id: string
}

interface FormModel {
  selection: AutocompleteOption<OfficeOptionExtra> | null
}

export default function OfficeSelector({ setCurrentOffice }: OfficeSubFormProps) {
  const alerterRef = useAlerter()
  const supabaseRef = useSupabaseClient()
  const sessionRef = useSession()
  const [loading, setLoading] = useState<boolean>(false)
  const [placeholder, setPlaceholder] = useState<string | null>('Loading...')
  const [existingOffices, setExsitingOffices] = useState<
    AutocompleteOptionNotNew<OfficeOptionExtra>[]
  >([])

  const [formModel, setFormModel] = useState<FormModel>({ selection: null })

  // Fetching the existing offices:
  useEffect(() => {
    ;(async () => {
      const { data, error } = await supabaseRef.current.from('LawOffice').select()
      if (error || data === null) {
        setPlaceholder('Unable to find law offices right now! Try again later')
      } else {
        const formattedOffices: AutocompleteOptionNotNew<OfficeOptionExtra>[] = data.map(office => {
          return { label: office.name, isNew: false, extra: { id: office.id } }
        })
        setExsitingOffices(formattedOffices)
        setPlaceholder(null)
      }
    })()
  }, [supabaseRef])

  const handleSubmit = async () => {
    if (formModel.selection === null) return
    setLoading(true)
    if (formModel.selection.isNew) {
      // Creating law office and updating lawyer profile if specified:
      const { data, error: insertError } = await supabaseRef.current
        .from('LawOffice')
        .insert({
          administratorId: sessionRef.current.user.id,
          name: formModel.selection.label,
        })
        .select()
        .single()
      if (insertError || data === null) {
        alerterRef.current.error(
          'Something went wrong when trying to create the new office! Try again later.',
        )
        setLoading(false)
        return
      }
      // Updating lawyer profile:
      const { error: updateError } = await supabaseRef.current
        .from('UserLawyer')
        .update({ officeId: data.id })
        .eq('id', sessionRef.current.user.id)
        .single()
      if (updateError) {
        alerterRef.current.error(
          'Something went wrong when trying to add you to the new office! Try again later.',
        )
        setLoading(false)
        return
      }
    } else {
      // Updating lawyer profile to existing law office if specified:
      const { error } = await supabaseRef.current
        .from('UserLawyer')
        .update({ officeId: formModel.selection.extra.id })
        .eq('id', sessionRef.current.user.id)
        .single()
      if (error) {
        alerterRef.current.error(
          'Something went wrong when trying to add you to the office! Try again later.',
        )
      }
    }
    setLoading(false)
    setCurrentOffice(undefined)
  }

  return (
    <>
      {placeholder !== null ? (
        <Typography variant="body1">{placeholder}</Typography>
      ) : (
        <ValidatedForm
          disabled={loading}
          model={formModel}
          setModel={setFormModel}
          onSubmit={handleSubmit}
        >
          <ValidatedAutocompleteDropdown
            name="selection"
            icon={<BusinessIcon />}
            label="Existing or New Office"
            options={existingOffices}
            canAddNew={true}
            addNewPrefix="Add new office"
            validator={notEmpty}
            helperText="Select an option."
            required
          />

          <ValidatedFormSubmitButton>
            {(formModel.selection?.isNew ?? true) ? 'Create' : 'Join'}
          </ValidatedFormSubmitButton>
        </ValidatedForm>
      )}
    </>
  )
}
