import React from 'react'
import { ResponsiveMUIDialog } from '$shared/ui/components/responsive-material-dialog'
import styles from './styles.module.scss'
import {
  Button,
  DialogActions,
  DialogContent,
  TextareaAutosize,
  useMediaQuery
} from '@mui/material'
import sjson from 'secure-json-parse'
import cx from 'classnames'
import { getItem as getItemFromLocalStorage, schema as localStorageSchema } from '$shared/storage'
import { z } from 'zod'
import plural from 'plural-ru'
import MdCheck from '$assets/icons/check.svg?react'
import { m } from '$m'

const importDataSchema = z.object({
  ...localStorageSchema.shape,
  pageId: z.string().min(1).max(32)
})
export function ImportDialog({ open, onClose }: { open: boolean; onClose: () => any }) {
  const [input, setInput] = React.useState('')
  const [success, setSuccess] = React.useState<false | number>(false)
  const isMobile = !useMediaQuery('(min-width: 768px)')

  React.useEffect(() => {
    if (!open) {
      setInput('')
      setSuccess(false)
    }
  }, [open])

  const isValid = React.useMemo(() => {
    if (!input) return true
    try {
      const result = sjson.parse(input)
      if (Array.isArray(result)) {
        if (result.length < 1) return false
        return result.every((page) => importDataSchema.safeParse(page).success)
      }
      return false
    } catch (e) {
      return false
    }
  }, [input])

  const handleImport = () => {
    const data = sjson.parse(input)
    for (const page of data) {
      const result = importDataSchema.parse(page)
      if (getItemFromLocalStorage(result.pageId) === null) {
        const { pageId, ...rest } = result
        window.localStorage.setItem(pageId, JSON.stringify(rest))
        window.dispatchEvent(new Event('storage'))
      }
    }
    setSuccess(data.length)
    setInput('')
  }

  return (
    <ResponsiveMUIDialog
      title={m.localstorage_import_title()}
      open={open}
      onClose={onClose}
      className={styles.dialogContent}
      actions={
        <DialogActions>
          <Button onClick={handleImport} disabled={!input || !isValid}>
            {m.localstorage_import_button()}
          </Button>
          {!isMobile && <Button onClick={onClose}>{m.localstorage_cancelButton()}</Button>}
        </DialogActions>
      }
    >
      <DialogContent className={styles.content}>
        <TextareaAutosize
          placeholder={m.localstorage_importInputPlaceholder()}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className={cx(styles.localStorageData, { [styles.error]: !isValid })}
        />
        {success && (
          <span className={styles.success}>
            <MdCheck />
            {plural(
              success,
              m.localstorage_linesImported_one(),
              m.localstorage_linesImported_few(),
              m.localstorage_linesImported_many()
            )}{' '}
            {success} {plural(success, m.lines_one(), m.lines_few(), m.lines_many())}
          </span>
        )}
      </DialogContent>
    </ResponsiveMUIDialog>
  )
}
