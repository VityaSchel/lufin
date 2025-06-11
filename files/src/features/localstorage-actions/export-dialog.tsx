import React from 'react'
import styles from './styles.module.scss'
import { loadFilesPages } from '$shared/storage'
import { ResponsiveMUIDialog } from '$shared/ui/components/responsive-material-dialog'
import { DialogContent, TextareaAutosize } from '@mui/material'
import { Button } from '$shared/ui/components/button'
import { MdContentCopy, MdDone } from 'react-icons/md'
import copy from 'copy-to-clipboard'
import { useTranslation } from 'next-i18next'

export function ExportDialog({ open, onClose }: {
  open: boolean
  onClose: () => any
}) {
  const { t } = useTranslation('filesharing')
  const filesPages = React.useMemo(() => JSON.stringify(loadFilesPages()), [])
  const [isCopied, setIsCopied] = React.useState(false)

  const handleCopy = () => {
    copy(filesPages)
    setIsCopied(true)
  }

  return (
    <ResponsiveMUIDialog 
      title={t('localstorage.export.title')}
      open={open} 
      onClose={onClose}
      className={styles.dialogContent}
    >
      <DialogContent className={styles.content}>
        <TextareaAutosize 
          value={filesPages}
          readOnly
          className={styles.localStorageData}
        />
        <Button 
          onClick={handleCopy}
          onMouseLeave={() => setIsCopied(false)}
        >
          {isCopied
            ? <><MdDone /> {t('localstorage.export.copied')}</>
            : <><MdContentCopy /> {t('localstorage.export.copy_button')}</>
          }
        </Button>
      </DialogContent>
    </ResponsiveMUIDialog>
  )
}