'use client'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import { ValidatedFormProps } from 'livelawyerlibrary/forms/validated-form'
import { FormEvent, ReactNode } from 'react'

export function PlatformValidatedForm<T extends object>({
  spacing,
  model,
  onSubmit,
  children,
}: ValidatedFormProps<T>) {
  return (
    <Container style={{ alignItems: 'stretch', flexGrow: 1, padding: 0 }}>
      <form
        noValidate
        onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault()
          onSubmit(model)
        }}
      >
        <Grid container spacing={spacing ?? 3}>
          {children as ReactNode}
        </Grid>
      </form>
    </Container>
  )
}
