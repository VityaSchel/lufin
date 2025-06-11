import React from 'react'
import styles from './styles.module.scss'
import { getFileType } from '$shared/utils/get-file-type'
import { PreviewText } from '$features/file-content-preview/preview-text'
import { PreviewZip } from '$features/file-content-preview/preview-zip'
import { Button } from '$shared/ui/components/button'
import { BiLinkExternal } from 'react-icons/bi'
import { IconButton, Tooltip, useMediaQuery } from '@mui/material'
import { mdiArrowLeft, mdiArrowRight } from '@mdi/js'
import Icon from '@mdi/react'
import { PreviewSpreadsheet } from '$features/file-content-preview/preview-spreadsheet'
import { m } from '$m'

export const supportedMimeTypes = [
  'audio',
  'image',
  'video',
  'pdf',
  'text',
  'archive',
  'spreadsheet'
] as const
export function FileContentPreview({
  file,
  slider
}: {
  file: File
  slider?: {
    onOpenPreviousPreview?: () => any
    onOpenNextPreview?: () => any
  }
}): JSX.Element {
  const fileType = React.useMemo(() => getFileType(file.type, file.name), [file])
  const isPreviewAvailable =
    fileType && supportedMimeTypes.includes(fileType as (typeof supportedMimeTypes)[number])

  const [fileBlobSrc, setFileBlobSrc] = React.useState<null | string>(null)

  React.useEffect(() => {
    if (isPreviewAvailable) {
      const blobSrc = URL.createObjectURL(file)
      setFileBlobSrc(blobSrc)
      return () => URL.revokeObjectURL(blobSrc)
    }
  }, [isPreviewAvailable, file])

  return isPreviewAvailable ? (
    fileBlobSrc !== null ? (
      <div className={styles.preview}>
        <Preview
          type={fileType as (typeof supportedMimeTypes)[number]}
          file={file}
          blobURL={fileBlobSrc}
          slider={slider}
        />
      </div>
    ) : (
      <></>
    )
  ) : (
    <div className={styles.previewUnavailable}>
      <span>{m.preview_unsupportedFileType()}</span>
    </div>
  )
}

function Preview({
  type,
  file,
  blobURL,
  slider
}: {
  type: (typeof supportedMimeTypes)[number]
  file: File
  blobURL: string
  slider?: {
    onOpenPreviousPreview?: () => any
    onOpenNextPreview?: () => any
  }
}): React.ReactElement {
  const isMobile = useMediaQuery('(max-width: 768px)')

  if (type === 'text') {
    return <PreviewText file={file} />
  }

  // eslint-disable-next-line @next/next/no-img-element
  if (type === 'image') {
    return (
      <div className={styles.imagePreviewContainer}>
        {!isMobile && slider && (
          <Tooltip title={m.preview_previousImageButton()}>
            <IconButton
              onClick={slider.onOpenPreviousPreview}
              disabled={!slider.onOpenPreviousPreview}
            >
              <Icon path={mdiArrowLeft} size={1} />
            </IconButton>
          </Tooltip>
        )}
        <div className={styles.imagePreview}>
          <Button
            variant={'dimmed'}
            iconButton
            onClick={() => window.open(blobURL, '_blank', 'noopener,noreferrer')}
            type="button"
            className={styles.imagePreviewButton}
          >
            <BiLinkExternal />
          </Button>
          <img src={blobURL} alt="" />
        </div>
        {!isMobile && slider && (
          <Tooltip title={m.preview_nextImageButton()}>
            <IconButton onClick={slider.onOpenNextPreview} disabled={!slider.onOpenNextPreview}>
              <Icon path={mdiArrowRight} size={1} />
            </IconButton>
          </Tooltip>
        )}
        {isMobile && slider && (
          <div className={styles.mobileSliderButtons}>
            <Tooltip title={m.preview_previousImageButton()}>
              <IconButton
                onClick={slider.onOpenPreviousPreview}
                disabled={!slider.onOpenPreviousPreview}
              >
                <Icon path={mdiArrowLeft} size={1.5} />
              </IconButton>
            </Tooltip>
            <Tooltip title={m.preview_nextImageButton()}>
              <IconButton onClick={slider.onOpenNextPreview} disabled={!slider.onOpenNextPreview}>
                <Icon path={mdiArrowRight} size={1.5} />
              </IconButton>
            </Tooltip>
          </div>
        )}
      </div>
    )
  }

  if (type === 'audio') {
    return <audio src={blobURL} controls />
  }

  if (type === 'video') {
    return <video src={blobURL} controls />
  }

  if (type === 'pdf') {
    return (
      <div className={styles.iframe}>
        <iframe src={blobURL} /*sandbox=''*/ />
        <Button onClick={() => window.open(blobURL, '_blank', 'noopener,noreferrer')}>
          <BiLinkExternal /> {m.preview_openInNewTab()}
        </Button>
      </div>
    )
  }

  if (type === 'archive') {
    return <PreviewZip zip={file} />
  }

  if (type === 'spreadsheet') {
    return <PreviewSpreadsheet spreadsheet={file} />
  }

  return <></>
}
