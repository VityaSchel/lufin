import styles from './styles.module.scss'
import { PasswordInput } from '$entities/password-input'
import { Headline } from '$entities/headline'
import type { PostRequestFilesResponse } from '$pages/api/files/[pageID]'
import type { SharedFileForDownload } from '$shared/model/shared-file'
import { Button } from '$shared/ui/components/button'
import { FormHelperText } from '@mui/material'
import React from 'react'
import { m } from '$m'
import { useParams } from 'react-router'

export function FilesPagePasswordInput({
  onSuccess
}: {
  onSuccess: (files: SharedFileForDownload[], password?: string) => any
}) {
  const [password, setInput] = React.useState('')
  const [error, setError] = React.useState<null | string>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = () => {
    if (!password || isSubmitting) return
    setIsSubmitting(true)
    setError(null)
    fetch(`/api/files/${useParams().pageID}`, {
      method: 'POST',
      headers: {
        // 'Content-Type': 'application/json',
        Authorization: password
      }
    })
      .then((response) => response.json())
      .then((response: PostRequestFilesResponse) => {
        if (!response.ok) {
          if (response.error === 'PASSWORD_INCORRECT') {
            setError(m['password_protection.incorrect_password']())
          } else {
            setError(m['password_protection.error']())
            console.error('Error while requesting files with password', response.error)
          }
        } else {
          onSuccess(response.files, password)
        }
      })
      .catch((e) => {
        setError(m['password_protection.error']())
        throw e
      })
      .finally(() => setIsSubmitting(false))
  }

  return (
    <section className={styles.passwordForm}>
      <Headline variant="h2">{m['password_protection.title']()}</Headline>
      <div className={styles.input}>
        <PasswordInput
          value={password}
          onChange={setInput}
          isOptional={false}
          onKeyUp={(e) => e.code === 'Enter' && handleSubmit()}
          disabled={isSubmitting}
          autoComplete="new-password"
        />
        {error !== null && <FormHelperText error>{error}</FormHelperText>}
      </div>
      <Button disabled={!password || isSubmitting} onClick={handleSubmit}>
        {m['password_protection.submit_button']()}
      </Button>
    </section>
  )
}
