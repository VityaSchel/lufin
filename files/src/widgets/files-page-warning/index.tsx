import React from 'react'
import styles from './styles.module.scss'
import { m } from '$m'

export function FilesPageWarning({ children }: React.PropsWithChildren) {
  return (
    process.env.NEXT_PUBLIC_CONTACT_EMAIL && (
      <div className={styles.top}>
        {children}
        <span className={styles.label}>
          {m['bug_reports_at']()} {process.env.NEXT_PUBLIC_CONTACT_EMAIL}
        </span>
      </div>
    )
  )
}
