import React from 'react'
import { Headline } from '$entities/headline'
import styles from './styles.module.scss'
import { markFilesPageDeleted } from '$shared/storage'
import { m } from '$m'
import { useParams } from 'react-router'

export function FilesDeleted({ success }: { success: boolean }) {
  const token = useParams().deletePageToken as string

  React.useEffect(() => {
    if (success) {
      if (typeof token === 'string') {
        markFilesPageDeleted(token)
      }
    }
  }, [success])

  return (
    <section className={styles.deletedFilesMessage}>
      <Headline>{success ? m.filesDeleted() : m.error()}</Headline>
    </section>
  )
}
