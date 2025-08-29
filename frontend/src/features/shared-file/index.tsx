import React from 'react'
import styles from './styles.module.scss'
import { HorizontalCard } from '$shared/ui/components/horizontal-card'
import byteSize from 'byte-size'
import {
  AppBar,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material'
import Download from './icons/download.svg'
import { getSvgIconByFileType } from '$shared/utils/get-svg-icon-by-filetype'
import { getFileType } from '$shared/utils/get-file-type'
import SyncAlert from '$assets/icons/sync-alert.svg?react'
import MUIButton from '@mui/material/Button'
import MdDone from '$assets/icons/done.svg?react'
import MdLink from '$assets/icons/link.svg?react'
import MdPreview from '$assets/icons/preview.svg?react'
import { FileContentPreview } from '$features/file-content-preview'
import { supportedMimeTypes as previewSupportedMimeTypes } from '$features/file-content-preview/mime-types'
import { InstantPreview, supportedInstantPreviews } from '$features/shared-file/instant-preview'
import cx from 'classnames'
import CloseIcon from '@mui/icons-material/Close'
import { useHotkeys } from 'react-hotkeys-hook'
import type { DownloadableFile } from '$shared/model/download-file'
import copy from 'copy-to-clipboard'
import { m } from '$m'
import { EmbedLinks } from '$features/embed-links'

const SharedFile = React.forwardRef(
  (
    {
      pageId,
      isErrored,
      downloadProgress,
      onDownloadStarted,
      onSave,
      file,
      encrypted,
      passwordProtected,
      content,
      onOpenPreviousPreview,
      onOpenNextPreview,
      i
    }: {
      pageId: string
      encrypted: boolean
      passwordProtected: boolean
      isErrored: boolean
      downloadProgress: number | false
      onDownloadStarted: (endedCallback?: 'SAVE' | 'PREVIEW') => any
      onSave: () => any
      file: DownloadableFile
      content?: Blob
      onOpenPreviousPreview?: () => any
      onOpenNextPreview?: () => any
      i: number
    },
    ref
  ) => {
    const fileType = React.useMemo(() => getFileType(file.mimeType, file.name), [file])
    const icon = getSvgIconByFileType(fileType)
    const [openPreview, setOpenPreview] = React.useState(false)
    const [previewRequested, setPreviewRequested] = React.useState(false)

    const fileInstance = React.useMemo(
      () => content && new File([content], file.name, { type: file.mimeType }),
      [file, content]
    )

    const isDownloading = downloadProgress !== false

    const handleOpenPreview = () => {
      if (content) {
        setPreviewRequested(true)
        setOpenPreview(true)
      } else {
        onDownloadStarted('PREVIEW')
      }
    }

    const previewAvailable = fileType && previewSupportedMimeTypes.includes(fileType)

    const handleStartDownloading = () => {
      if (content) {
        onSave()
      } else {
        onDownloadStarted('SAVE')
      }
    }

    React.useImperativeHandle(ref, () => ({
      triggerPreview
    }))

    const triggerPreview = () => {
      setPreviewRequested(true)
      setOpenPreview(true)
    }

    const isFirstRender = React.useRef(true)
    React.useEffect(() => {
      if (
        fileType &&
        supportedInstantPreviews.includes(fileType) &&
        file.sizeInBytes < 1024 * 1024 * 10 &&
        isFirstRender.current
      ) {
        isFirstRender.current = false
        setTimeout(() => onDownloadStarted(), i * 2)
      }
    }, [fileType])

    const handleOpenPreviousPreview =
      onOpenPreviousPreview &&
      (() => {
        setOpenPreview(false)
        onOpenPreviousPreview()
      })

    const handleOpenNextPreview =
      onOpenNextPreview &&
      (() => {
        setOpenPreview(false)
        onOpenNextPreview()
      })

    const [directLinkCopied, setDirectLinkCopied] = React.useState(false)
    const handleCopyDirectLink = () => {
      setDirectLinkCopied(true)
      copy(
        `${window.location.origin + window.location.pathname}/${encodeURIComponent(file.name)}${window.location.hash}`
      )
    }

    return (
      <div className={styles.file}>
        <div className={styles.top}>
          <HorizontalCard
            icon={icon}
            title={file.name}
            subtitle={byteSize(file.sizeInBytes).toString()}
            onClick={handleOpenPreview}
          />
          {isErrored ? (
            <IconButton onClick={() => onDownloadStarted()}>
              <SyncAlert />
            </IconButton>
          ) : isDownloading && !content ? (
            <CircularProgress
              size={30}
              variant={downloadProgress === 0 ? 'indeterminate' : 'determinate'}
              value={downloadProgress * 100}
            />
          ) : (
            <div className={styles.flex}>
              <Tooltip title={m.directLink()}>
                <IconButton
                  onClick={handleCopyDirectLink}
                  onPointerLeave={() => setDirectLinkCopied(false)}
                >
                  {directLinkCopied ? <MdDone /> : <MdLink />}
                </IconButton>
              </Tooltip>
              {previewAvailable && (
                <PreviewButton file={file} content={content} onClick={handleOpenPreview} />
              )}
              <Tooltip title={m.download()}>
                <IconButton onClick={handleStartDownloading}>
                  <Download />
                </IconButton>
              </Tooltip>
            </div>
          )}
        </div>
        <InstantPreview file={file} content={fileInstance} />
        {previewRequested && fileInstance && (
          <PreviewDialog
            open={openPreview}
            file={file}
            fileInstance={fileInstance}
            onClose={() => setOpenPreview(false)}
            onOpenPreviousPreview={handleOpenPreviousPreview}
            onOpenNextPreview={handleOpenNextPreview}
          />
        )}
        {!encrypted && !passwordProtected && fileType === 'image' && (
          <EmbedLinks pageId={pageId} file={file.name} />
        )}
      </div>
    )
  }
)
SharedFile.displayName = 'SharedFile'
export { SharedFile }

const supportedTypes: string[] = ['video', 'audio', 'image', 'pdf', 'text']
function PreviewButton({
  onClick,
  file,
  content
}: {
  onClick: () => any
  file: DownloadableFile
  content?: Blob
}) {
  const [blobURL, setBlobURL] = React.useState<string | null>(null)

  const isBlobInNewtabSupported = React.useMemo(
    () => supportedTypes.includes(getFileType(file.mimeType, file.name) ?? ''),
    [file]
  )

  React.useEffect(() => {
    if (isBlobInNewtabSupported && content) {
      const url = URL.createObjectURL(content)
      setBlobURL(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setBlobURL(null)
    }
  }, [isBlobInNewtabSupported, content])

  const canOpenInNewTab = isBlobInNewtabSupported && blobURL

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    if ((e.metaKey || e.ctrlKey) && canOpenInNewTab) {
      window.open(blobURL, '_blank', 'noopener,noreferrer')?.focus()
    } else {
      onClick()
    }
  }

  const isMacOS = /Mac|iPod|iPhone|iPad/.test(navigator.platform)

  return (
    <Tooltip
      title={
        m.preview_openLabel() +
        (canOpenInNewTab
          ? `\n${isMacOS ? '⌘' : 'ctrl'}+${m.click()} — ${m.preview_openInNewTab().toLowerCase()}`
          : '')
      }
    >
      <IconButton onClick={handleClick}>
        <MdPreview />
      </IconButton>
    </Tooltip>
  )
}

function PreviewDialog({
  open,
  onClose,
  file,
  fileInstance,
  onOpenPreviousPreview,
  onOpenNextPreview
}: {
  open: boolean
  onClose: () => any
  file: DownloadableFile
  fileInstance: File
  onOpenPreviousPreview?: () => any
  onOpenNextPreview?: () => any
}) {
  const fileType = React.useMemo(() => getFileType(file.mimeType, file.name), [file])
  const isMobile = !useMediaQuery('(min-width: 768px)')
  const delayedOpen = React.useRef<Promise<void> | false>(false)

  useHotkeys(
    ['ArrowRight', 'ArrowLeft'],
    async (_, e) => {
      if (
        delayedOpen.current !== false &&
        (await promiseState(delayedOpen.current)) === 'fulfilled'
      ) {
        switch (e.keys?.join('')) {
          case 'left':
            onOpenPreviousPreview?.()
            break

          case 'right':
            onOpenNextPreview?.()
            break

          default:
            break
        }
      }
    },
    {},
    [onOpenPreviousPreview, onOpenNextPreview]
  )

  React.useEffect(() => {
    if (open) {
      delayedOpen.current = new Promise<void>((resolve) => setTimeout(resolve, 100))
    } else {
      delayedOpen.current = false
    }
  }, [open])

  return (
    <Dialog
      open={open}
      onClose={() => onClose()}
      keepMounted={false}
      scroll="paper"
      className={cx({ [styles.fullScreen]: fileType === 'image' })}
      fullScreen={isMobile}
    >
      {isMobile ? (
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={() => onClose()} aria-label="close">
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1, fontSize: '1rem' }} variant="h6" component="div">
              {m.preview_title()} <b>{file.name}</b>
            </Typography>
          </Toolbar>
        </AppBar>
      ) : (
        <DialogTitle>
          {m.preview_title()} <b>{file.name}</b>
        </DialogTitle>
      )}
      <DialogContent className={styles.content}>
        {fileInstance && (
          <FileContentPreview
            file={fileInstance}
            slider={{
              onOpenPreviousPreview: onOpenPreviousPreview,
              onOpenNextPreview: onOpenNextPreview
            }}
          />
        )}
      </DialogContent>
      {!isMobile && (
        <DialogActions>
          <MUIButton onClick={() => onClose()}>{m.okButton()}</MUIButton>
        </DialogActions>
      )}
    </Dialog>
  )
}

function promiseState(p: Promise<any>): Promise<'pending' | 'fulfilled' | 'rejected'> {
  const t = {}
  return Promise.race([p, t]).then(
    (v) => (v === t ? 'pending' : 'fulfilled'),
    () => 'rejected'
  )
}
