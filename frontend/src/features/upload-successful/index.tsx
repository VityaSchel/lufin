import styles from './styles.module.scss'
import { Headline } from '$entities/headline'
import { CopyIconButton } from '$shared/ui/components/copy-icon-button'
import { TextField } from '$shared/ui/components/text-field'
import type { Links } from '$widgets/upload-files-tab'
import { IconButton, useMediaQuery } from '@mui/material'
import { Link } from 'react-router'
import BiLinkExternal from '$assets/icons/link-external.svg?react'
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
          {plural(filesNum, m.files_one(), m.files_few(), m.files_many())}
        </span>{' '}
        {plural(filesNum, m.uploaded_one(), m.uploaded_few(), m.uploaded_many())}
      </Headline>
      <div className="flex flex-col gap-1">
        <TextField
          variant="outlined"
          label={m.uploadSuccess_filesLink()}
          value={downloadLink}
          readOnly
          leftAdornment={<DownloadIcon />}
          rightAdornment={
            <div className={styles.flex}>
              {!isMobile && (
                <Link
                  to={downloadLink}
                  target="_blank"
                  rel="nofollow noreferrer"
                  className="flex items-center justify-center"
                >
                  <IconButton className="flex items-center justify-center">
                    <BiLinkExternal width={28} height={28} />
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
            label={m.uploadSuccess_passwordInput()}
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
          label={m.uploadSuccess_deleteLinkInput()}
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
        <Button onClick={() => onResetForm()}>{m.loadMore()}</Button>
        <Button onClick={() => onGoToMyFiles()} variant="dimmed">
          {m.myFiles()}
        </Button>
        <CopyButton
          content={`${m.uploadSuccess_links()}: ${downloadLink}\n${m.uploadSuccess_password()}: ${password || m.uploadSuccess_passwordNotSpecified()}\n\n${m.uploadSuccess_deleteLink()}: ${links.delete} (${m.uploadSuccess_deleteLinkWarning()})`}
          className={styles.copyButton}
        >
          {m.uploadSuccess_copyAllButton()}
        </CopyButton>
      </div>
    </div>
  )
}
