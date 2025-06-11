import React from 'react'
import styles from './styles.module.scss'
import { Button } from '$shared/ui/components/button'
import ImportIcon from './icons/import.svg'
import ExportIcon from './icons/export.svg'
import DeleteIcon from './icons/delete.svg'
import { clearUnavailableFiles } from '$shared/storage'
import { ExportDialog } from '$features/localstorage-actions/export-dialog'
import { ImportDialog } from '$features/localstorage-actions/import-dialog'
import { m } from '$m'

export function LocalStorageActions() {
  const [openExportDialog, setOpenExportDialog] = React.useState(false)
  const [openImportDialog, setOpenImportDialog] = React.useState(false)

  const handleExport = () => {
    setOpenExportDialog(true)
  }

  const handleImport = () => {
    setOpenImportDialog(true)
  }

  const handleClear = () => {
    clearUnavailableFiles()
  }

  return (
    <div className={styles.actions}>
      <Button variant="dimmed" accent="blue" onClick={handleExport}>
        {m['localstorage.export_button']()} <ImportIcon />
      </Button>
      <ExportDialog open={openExportDialog} onClose={() => setOpenExportDialog(false)} />
      <Button variant="dimmed" accent="green" onClick={handleImport}>
        {m['localstorage.import_button']()} <ExportIcon />
      </Button>
      <ImportDialog open={openImportDialog} onClose={() => setOpenImportDialog(false)} />
      <Button variant="dimmed" accent="red" onClick={handleClear}>
        {m['localstorage.clear_button']()} <DeleteIcon />
      </Button>
    </div>
  )
}
