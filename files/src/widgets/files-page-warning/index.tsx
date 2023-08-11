import React from 'react'
import styles from './styles.module.scss'
import { useTranslation } from 'next-i18next'

export function FilesPageWarning({ children }: React.PropsWithChildren) {
  const { t } = useTranslation('filesharing')

  return process.env.NEXT_PUBLIC_CONTACT_EMAIL && (
    <div className={styles.top}>
      {children}
      <span className={styles.label}>{t('bug_reports_at')} {process.env.NEXT_PUBLIC_CONTACT_EMAIL}</span>
    </div>
  )
}