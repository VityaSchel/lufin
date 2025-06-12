import React from 'react'
import styles from './styles.module.scss'
import { TextField } from '$shared/ui/components/text-field'
import { IconButton } from '@mui/material'
import ViewIcon from './icons/view.svg'
import HiddenIcon from './icons/hidden.svg'
import { m } from '$m'

export function PasswordInput({
  value,
  onChange,
  isOptional = true,
  ...props
}: {
  value: string
  onChange: (newPassword: string) => any
  isOptional?: boolean
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false)

  return (
    <TextField
      leftAdornment={
        <IconButton onClick={() => setIsPasswordVisible(!isPasswordVisible)}>
          {isPasswordVisible ? <HiddenIcon /> : <ViewIcon />}
        </IconButton>
      }
      className={styles.passwordField}
      onClear={() => onChange('')}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      variant="outlined"
      label={
        isOptional
          ? m.passwordProtection_setPasswordLabel()
          : m.uploadSuccess_passwordInput()
      }
      placeholder={isOptional ? m.optional() : m.passwordProtection_inputPasswordLabel()}
      type={isPasswordVisible ? 'text' : 'password'}
      maxLength={128}
      {...props}
    />
  )
}
