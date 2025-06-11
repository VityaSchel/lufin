import styles from './styles.module.scss'
import { Headline } from '$entities/headline'
import { CopyIconButton } from '$shared/ui/components/copy-icon-button'
import { TextField } from '$shared/ui/components/text-field'
import type { Links } from '$widgets/upload-files-tab'
import { IconButton, useMediaQuery } from '@mui/material'
import { Link } from 'react-router'
import { BiLinkExternal } from 'react-icons/bi'
import DeleteIcon from '$assets/delete.svg'
import DownloadIcon from '$assets/download.svg'
import { Button } from '$shared/ui/components/button'
import { CopyButton } from '$shared/ui/components/copy-button'
import { m } from '$m'
import plural from 'plural-ru'

export function UploadSuccessful({
  filesNum,
  links,
  password,
  onResetForm,
  onGoToMyFiles
}: {
  filesNum: number
  links: Links
  password: string | null
  onResetForm: () => any
  onGoToMyFiles: () => any
}) {
  const downloadUrl = new URL(links.download)
  const downloadLink =
    downloadUrl.protocol + '//' + downloadUrl.host + downloadUrl.pathname + downloadUrl.hash
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <div className={styles.filesUploaded}>
      <Headline variant="h2">
        <span className="capitalize">
          {plural(filesNum, m['files.one'](), m['files.few'](), m['files.many']())}
        </span>{' '}
        {plural(filesNum, m['uploaded.one'](), m['uploaded.few'](), m['uploaded.many']())}
      </Headline>
      <div className="flex flex-col gap-1">
        <TextField
          variant="outlined"
          label={m['upload_success.files_link']()}
          value={downloadLink}
          readOnly
          leftAdornment={<DownloadIcon />}
          rightAdornment={
            <div className={styles.flex}>
              {!isMobile && (
                <Link to={downloadLink} target="_blank" rel="nofollow noreferrer">
                  <IconButton>
                    <BiLinkExternal />
                  </IconButton>
                </Link>
              )}
              <CopyIconButton content={downloadLink} />
            </div>
          }
        />
        {password && (
          <TextField
            variant="outlined"
            label={m['upload_success.password_input']()}
            type="password"
            value={password}
            readOnly
            rightAdornment={
              <div className={styles.flex}>
                <CopyIconButton content={password} />
              </div>
            }
          />
        )}
        <TextField
          variant="outlined"
          label={m['upload_success.delete_link_input']()}
          value={links.delete}
          readOnly
          leftAdornment={<DeleteIcon />}
          rightAdornment={
            <div className={styles.flex}>
              <CopyIconButton content={links.delete} />
            </div>
          }
        />
      </div>
      <div className={styles.actions}>
        <Button onClick={() => onResetForm()}>{m['load_more']()}</Button>
        <Button onClick={() => onGoToMyFiles()} variant="dimmed">
          {m['my_files']()}
        </Button>
        <CopyButton
          content={`${m['upload_success.links']()}: ${downloadLink}\n${m['upload_success.password']()}: ${password || m['upload_success.password_not_specified']()}\n\n${m['upload_success.delete_link']()}: ${links.delete} (${m['upload_success.delete_link_warning']()})`}
          className={styles.copyButton}
        >
          {m['upload_success.copy_all_button']()}
        </CopyButton>
      </div>
    </div>
  )
}
