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
import _ from 'lodash'
import plural from 'plural-ru'
import { MdCheck } from 'react-icons/md'
import { m } from '$m'

const importDataSchema = z.object({
  ...localStorageSchema.shape,
  pageID: z.string().min(1).max(32)
})
export function ImportDialog({ open, onClose }: { open: boolean; onClose: () => any }) {
  const [input, setInput] = React.useState('')
  const [success, setSuccess] = React.useState<false | number>(false)
  const isMobile = useMediaQuery('(max-width: 768px)')

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
      if (getItemFromLocalStorage(result.pageID) === null) {
        const pageWithoutPageID = _.omit(result, 'pageID')
        window.localStorage.setItem(result.pageID, JSON.stringify(pageWithoutPageID))
        window.dispatchEvent(new Event('storage'))
      }
    }
    setSuccess(data.length)
    setInput('')
  }

  return (
    <ResponsiveMUIDialog
      title={m['localstorage.import.title']()}
      open={open}
      onClose={onClose}
      className={styles.dialogContent}
      actions={
        <DialogActions>
          <Button onClick={handleImport} disabled={!input || !isValid}>
            {m['localstorage.import.button']()}
          </Button>
          {!isMobile && <Button onClick={onClose}>{m['localstorage.cancel_button']()}</Button>}
        </DialogActions>
      }
    >
      <DialogContent className={styles.content}>
        <TextareaAutosize
          placeholder={m['localstorage.import_input_placeholder']()}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className={cx(styles.localStorageData, { [styles.error]: !isValid })}
        />
        {success && (
          <span className={styles.success}>
            <MdCheck />
            {plural(
              success,
              m['localstorage.lines_imported.one'](),
              m['localstorage.lines_imported.few'](),
              m['localstorage.lines_imported.many']()
            )}{' '}
            {success} {plural(success, m['lines.one'](), m['lines.few'](), m['lines.many']())}
          </span>
        )}
      </DialogContent>
    </ResponsiveMUIDialog>
  )
}
