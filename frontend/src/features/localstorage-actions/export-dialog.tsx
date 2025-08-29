import React from 'react'
import styles from './styles.module.scss'
import { loadFilesPages } from '$shared/local-storage'
import { ResponsiveMUIDialog } from '$shared/ui/components/responsive-material-dialog'
import { DialogContent, TextareaAutosize } from '@mui/material'
import { Button } from '$shared/ui/components/button'
import MdContentCopy from '$assets/icons/copy-content.svg?react'
import MdDone from '$assets/icons/done.svg?react'
import copy from 'copy-to-clipboard'
import { m } from '$m'

export function ExportDialog({ open, onClose }: { open: boolean; onClose: () => any }) {
  const filesPages = React.useMemo(() => JSON.stringify(loadFilesPages()), [])
  const [isCopied, setIsCopied] = React.useState(false)

  const handleCopy = () => {
    copy(filesPages)
    setIsCopied(true)
  }

  return (
    <ResponsiveMUIDialog
      title={m.localstorage_export_title()}
      open={open}
      onClose={onClose}
      className={styles.dialogContent}
    >
      <DialogContent className={styles.content}>
        <TextareaAutosize value={filesPages} readOnly className={styles.localStorageData} />
        <Button onClick={handleCopy} onMouseLeave={() => setIsCopied(false)}>
          {isCopied ? (
            <>
              <MdDone /> {m.localstorage_export_copied()}
            </>
          ) : (
            <>
              <MdContentCopy /> {m.localstorage_export_copyButton()}
            </>
          )}
        </Button>
      </DialogContent>
    </ResponsiveMUIDialog>
  )
}
