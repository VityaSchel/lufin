import React from 'react'
import styles from './styles.module.scss'
import { Button } from '@/shared/ui/components/button'
import ImportIcon from './icons/import.svg'
import ExportIcon from './icons/export.svg'
import DeleteIcon from './icons/delete.svg'
import { clearUnavailableFiles } from '@/shared/storage'
import { ExportDialog } from '@/features/localstorage-actions/export-dialog'
import { ImportDialog } from '@/features/localstorage-actions/import-dialog'
import { useTranslation } from 'next-i18next'

export function LocalStorageActions() {
  const { t } = useTranslation('filesharing')
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
      <Button 
        variant='dimmed'
        accent='blue'
        onClick={handleExport}
      >
        {t('localstorage.export_button')} <ImportIcon />
      </Button>
      <ExportDialog open={openExportDialog} onClose={() => setOpenExportDialog(false)} />
      <Button 
        variant='dimmed'
        accent='green'
        onClick={handleImport}
      >
        {t('localstorage.import_button')} <ExportIcon />
      </Button>
      <ImportDialog open={openImportDialog} onClose={() => setOpenImportDialog(false)} />
      <Button
        variant='dimmed'
        accent='red'
        onClick={handleClear}
      >
        {t('localstorage.clear_button')} <DeleteIcon />
      </Button>
    </div>
  )
}