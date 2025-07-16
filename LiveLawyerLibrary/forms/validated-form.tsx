import React from 'react'
import { createContext, Dispatch, ReactNode, SetStateAction, useState } from 'react'
import { usePlatformValidatedFormComponents } from '../context-manager'

export const FormDisablingContext = createContext<boolean>(false)
export const FormInvalidationsContext = createContext<{
  invalidations: Set<string>
  setInvalidations: Dispatch<SetStateAction<Set<string>>>
}>({ invalidations: new Set(), setInvalidations: () => {} })
export const FormModelContext = createContext<{
  model: object
  setModel: Dispatch<SetStateAction<object>>
}>({ model: {}, setModel: () => {} })

export interface ValidatedFormProps<T extends object> {
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
  const { Form } = usePlatformValidatedFormComponents()
  const [invalidations, setInvalidations] = useState<Set<string>>(new Set())

  return (
    <FormDisablingContext.Provider value={disabled ?? false}>
      <FormInvalidationsContext.Provider value={{ invalidations, setInvalidations }}>
        <FormModelContext.Provider
          value={{
            model: model,
            setModel: setModel as Dispatch<SetStateAction<object>>,
          }}
        >
          <Form
            disabled={disabled}
            spacing={spacing}
            model={model}
            // TODO: Assign proper types with more advanced TypeScript
            setModel={setModel as Dispatch<SetStateAction<object>>}
            onSubmit={onSubmit as (model: object) => unknown}
            children={children}
          />
        </FormModelContext.Provider>
      </FormInvalidationsContext.Provider>
    </FormDisablingContext.Provider>
  )
}
