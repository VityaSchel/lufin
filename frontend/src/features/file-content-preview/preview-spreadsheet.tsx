import React from 'react'
import styles from './styles.module.scss'
import { Button } from '$shared/ui/components/button'
import PiWarningLight from '$assets/icons/warning-light.svg?react'
import { m } from '$m'

function PreviewSpreadsheetSafeGuard({ spreadsheet }: { spreadsheet: File }) {
  const [confirmed, setConfirmed] = React.useState(false)

  return spreadsheet.size > 1000000 && !confirmed ? (
    <div className={styles.spreadsheetIsTooBigWarning}>
      <PiWarningLight className={styles.icon} />
      <span>{m.preview_spreadsheetBigWarning()}</span>
      <Button onClick={() => setConfirmed(true)}>{m.preview_spreadsheetBigConfirmButton()}</Button>
    </div>
  ) : (
    <React.Suspense fallback={<span>Loading...</span>}>
      <XlsxRenderer spreadsheet={spreadsheet} />
    </React.Suspense>
  )
}

const XlsxRenderer = React.lazy(() => import('./xlsx-renderer'))

export { PreviewSpreadsheetSafeGuard as PreviewSpreadsheet }
