import React from 'react'
import styles from './styles.module.scss'
import { m } from '$m'

const email = import.meta.env.VITE_CONTACT_EMAIL
export function FilesPageWarning({ children }: React.PropsWithChildren) {
  return (
    email && (
      <div className={styles.top}>
        {children}
        <span className={styles.label}>
          {m.bugReportsAt()} {email}
        </span>
      </div>
    )
  )
}
