import CssBaseline from '@mui/material/CssBaseline'
import Grid from '@mui/material/Grid'
import { createContext, Dispatch, FormEvent, ReactNode, SetStateAction, useState } from 'react'

export const FormDisablingContext = createContext<boolean>(false)
export const FormInvalidationsContext = createContext<{
  invalidations: Set<string>
  setInvalidations: Dispatch<SetStateAction<Set<string>>>
}>({ invalidations: new Set(), setInvalidations: () => {} })
export const FormModelContext = createContext<{
  model: object
  setModel: Dispatch<SetStateAction<object>>
}>({ model: {}, setModel: () => {} })

interface ValidatedFormProps<T extends object> {
  disabled?: boolean
  spacing?: number
  model: T
  setModel: Dispatch<SetStateAction<T>>
  onSubmit: (model: T) => unknown
  children?: ReactNode
}

export function ValidatedForm<T extends object>({
  disabled,
  spacing,
  model,
  setModel,
  onSubmit,
  children,
}: ValidatedFormProps<T>) {
  const [invalidations, setInvalidations] = useState<Set<string>>(new Set())

  return (
    <form
      noValidate
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        onSubmit(model)
      }}
    >
      <FormDisablingContext.Provider value={disabled ?? false}>
        <FormInvalidationsContext.Provider value={{ invalidations, setInvalidations }}>
          <FormModelContext.Provider
            value={{ model, setModel: setModel as Dispatch<SetStateAction<object>> }}
          >
            <CssBaseline />
            <Grid container spacing={spacing ?? 3}>
              {children}
            </Grid>
          </FormModelContext.Provider>
        </FormInvalidationsContext.Provider>
      </FormDisablingContext.Provider>
    </form>
  )
}
