import styles from './styles.module.scss'
import { PasswordInput } from '$entities/password-input'
import { Headline } from '$entities/headline'
import { Button } from '$shared/ui/components/button'
import { FormHelperText } from '@mui/material'
import React from 'react'
import { m } from '$m'

export function FilesPagePasswordInput({
  onSubmit,
  error,
  submitting
}: {
  onSubmit: (password: string) => void
  error: boolean
  submitting: boolean
}) {
  const [password, setInput] = React.useState('')

  const handleSubmit = async () => {
    if (!password || submitting) return

    onSubmit(password)
  }

  return (
    <section className={styles.passwordForm}>
      <Headline variant="h2">{m.passwordProtection_title()}</Headline>
      <div className={styles.input}>
        <PasswordInput
          value={password}
          onChange={setInput}
          isOptional={false}
          onKeyUp={(e) => e.code === 'Enter' && handleSubmit()}
          disabled={submitting}
          autoComplete="new-password"
        />
        {error !== null && <FormHelperText error>{m.passwordProtection_error()}</FormHelperText>}
      </div>
      <Button disabled={!password || submitting} onClick={handleSubmit}>
        {m.passwordProtection_submitButton()}
      </Button>
    </section>
  )
}
