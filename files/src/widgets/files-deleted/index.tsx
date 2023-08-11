import React from 'react'
import { Headline } from '@/entities/headline'
import styles from './styles.module.scss'
import { markFilesPageDeleted } from '@/shared/storage'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

export function FilesDeleted({ success }: {
  success: boolean
}) {
  const { t } = useTranslation('filesharing')
  const router = useRouter()

  React.useEffect(() => {
    if(success) {
      const token = router.query.deletePageToken
      if(typeof token === 'string') {
        markFilesPageDeleted(token)
      }
    }
  }, [success])

  return (
    <section className={styles.deletedFilesMessage}>
      <Headline>{success ? t('files_deleted') : t('error')}</Headline>
    </section>
  )
}