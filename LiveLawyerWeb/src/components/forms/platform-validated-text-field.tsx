'use client'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import { ReactNode } from 'react'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import { PlatformValidatedTextFieldProps } from 'livelawyerlibrary/forms/validated-text-field'

export function PlatformValidatedTextField({
  name,
  type,
  icon,
  label,
  helperText,
  required,
  size,
  disabled,
  error,
  showHelperText,
  value,
  onChange,
}: PlatformValidatedTextFieldProps) {
  return (
    <Grid size={size ?? 12}>
      <TextField
        fullWidth
        disabled={disabled}
        type={type}
        name={name}
        label={
          <Stack direction="row" display="flex">
            {icon as ReactNode}
            <Typography variant="body1" sx={{ marginLeft: 0.5 }}>
              {`${label}${required ? ' *' : ''}`}
            </Typography>
          </Stack>
        }
        slotProps={{ inputLabel: { required: false } }}
        variant="standard"
        value={value}
        onChange={event => onChange(event.target.value)}
        required={required ?? false}
        error={error}
        helperText={showHelperText && helperText}
      />
    </Grid>
  )
}
