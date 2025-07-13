import { createContext, Dispatch, ReactNode, SetStateAction, useState } from 'react'
import { StyleSheet, View } from 'react-native'

export const FormDisablingContext = createContext<boolean>(false)
export const FormInvalidationsContext = createContext<{
  invalidations: Set<string>
  setInvalidations: Dispatch<SetStateAction<Set<string>>>
}>({ invalidations: new Set(), setInvalidations: () => {} })
export const FormModelContext = createContext<{
  model: object
  setModel: Dispatch<SetStateAction<object>>
}>({ model: {}, setModel: () => {} })
export const FormSubmittingContext = createContext<() => void>(() => {})

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
  const handleSubmit = () => onSubmit(model)

  return (
    <FormDisablingContext.Provider value={disabled ?? false}>
      <FormInvalidationsContext.Provider value={{ invalidations, setInvalidations }}>
        <FormModelContext.Provider
          value={{ model, setModel: setModel as Dispatch<SetStateAction<object>> }}
        >
          <FormSubmittingContext.Provider value={handleSubmit}>
            <View style={[styles.grid, { gap: spacing ?? 18 }]}>{children}</View>
          </FormSubmittingContext.Provider>
        </FormModelContext.Provider>
      </FormInvalidationsContext.Provider>
    </FormDisablingContext.Provider>
  )
}

const styles = StyleSheet.create({
  grid: { display: 'flex', flexDirection: 'column', margin: 24 },
})
