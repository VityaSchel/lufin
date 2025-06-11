import React from 'react'
import styles from './styles.module.scss'
import { m } from '$m'

export function FilesPageWarning({ children }: React.PropsWithChildren) {
  return (
    import.meta.env.VITE_CONTACT_EMAIL && (
      <div className={styles.top}>
        {children}
        <span className={styles.label}>
          {m.bugReportsAt()} {import.meta.env.VITE_CONTACT_EMAIL}
        </span>
      </div>
    )
  )
}
