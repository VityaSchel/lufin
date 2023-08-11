import React from 'react'
import styles from './styles.module.scss'
import { TextField } from '@/shared/ui/components/text-field'
import { IconButton, useMediaQuery } from '@mui/material'
import ViewIcon from './icons/view.svg'
import HiddenIcon from './icons/hidden.svg'
import { useTranslation } from 'next-i18next'

export function PasswordInput({ value, onChange, isOptional = true, ...props }: {
  value: string
  onChange: (newPassword: string) => any
  isOptional?: boolean
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const { t } = useTranslation('filesharing')
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
      variant='outlined'
      label={isOptional ? t('password_protection.set_password_label') : t('upload_success.password_input')}
      placeholder={isOptional ? t('optional') : t('password_protection.input_password_label')}
      type={isPasswordVisible ? 'text' : 'password'}
      maxLength={128}
      {...props}
    />
  )
}