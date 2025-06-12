import React from 'react'
import styles from './styles.module.scss'
import cx from 'classnames'
import { CircularProgress, Collapse, Fade, IconButton, Radio, useMediaQuery } from '@mui/material'
import { HorizontalCard } from '$shared/ui/components/horizontal-card'
import byteSize from 'byte-size'
import MdClose from '$assets/icons/close.svg?react'
import MdOutlineArrowForwardIos from '$assets/icons/chevron-right.svg?react'
import { FileContentPreview } from '$features/file-content-preview'
import { supportedMimeTypes as previewSupportedMimeTypes } from '$features/file-content-preview/mime-types'
import { getFileType } from '$shared/utils/get-file-type'
import { getSvgIconByFileType } from '$shared/utils/get-svg-icon-by-filetype'
import { RenamableTitle } from '$entities/uploadable-file/renamable-title'
import { Progress } from '$shared/ui/progress'
import filesize from 'byte-size'
import type { UploadableFile as UploadableFileType } from '$shared/uploadable-file'
import { produce } from 'immer'
import { m } from '$m'
import { getLocale } from '$paraglide/runtime'

export function UploadableFile({
  file,
  setFile,
  onRemove,
  onRename,
  disableEditing,
  progress
}: {
  file: UploadableFileType
  setFile: (file: UploadableFileType) => void
  onRename: (newFilename: string) => any
  onRemove: () => any
  disableEditing: boolean
  progress: number | null
}) {
  const [previewOpen, setPreviewOpen] = React.useState(false)
  const isMobile = !useMediaQuery('(min-width: 768px)')

  const fileType = React.useMemo(() => getFileType(file.type, file.name), [file])
  const icon = getSvgIconByFileType(fileType)
  const previewAvailable = previewSupportedMimeTypes.includes(
    fileType as (typeof previewSupportedMimeTypes)[number]
  )

  return (
    <>
      <Fade in={true}>
        <Collapse orientation="vertical" in={true}>
          <div className={cx(styles.outlined, styles.file)}>
            <div
              className={styles.mobileTop}
              onClick={isMobile ? () => setPreviewOpen(!previewOpen) : undefined}
            >
              <div className={styles.fileTop}>
                <HorizontalCard
                  icon={icon}
                  title={
                    <RenamableTitle
                      value={file.name}
                      onChange={onRename}
                      placeholder={file.initialName}
                      readonly={disableEditing}
                    />
                  }
                  subtitle={byteSize(file.blob.size).toString()}
                />
                <div className={styles.buttons}>
                  {previewAvailable && !isMobile && (
                    <IconButton
                      onClick={() => setPreviewOpen(!previewOpen)}
                      className={cx(styles.previewSlide, { [styles.open]: previewOpen })}
                    >
                      <MdOutlineArrowForwardIos />
                    </IconButton>
                  )}
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemove()
                    }}
                    className={styles.removeButton}
                    disabled={disableEditing}
                  >
                    <MdClose />
                  </IconButton>
                </div>
              </div>
              {previewAvailable && isMobile && (
                <span className={styles.openPreview}>
                  {m.uploadableFile_pressTo()}{' '}
                  {previewOpen ? m.uploadableFile_close() : m.uploadableFile_open()}{' '}
                  {m.uploadableFile_preview()}
                </span>
              )}
            </div>
            {previewAvailable && (
              <div className={styles.preview}>
                <Collapse orientation="vertical" in={previewOpen}>
                  <div
                    className={cx('mt-4 h-full', {
                      [styles.smallPreview]: ['audio', 'archive'].includes(
                        fileType as (typeof previewSupportedMimeTypes)[number]
                      )
                    })}
                  >
                    {fileType === 'image' &&
                    file.type !== 'image/gif' &&
                    file.type !== 'image/webp' &&
                    file.altBlob ? (
                      <UploadableImageCompressedPreview file={file} setFile={setFile} />
                    ) : (
                      <FileContentPreview
                        file={new File([file.blob], file.name, { type: file.type })}
                      />
                    )}
                  </div>
                </Collapse>
              </div>
            )}
            <Progress progress={progress} />
          </div>
        </Collapse>
      </Fade>
    </>
  )
}

function UploadableImageCompressedPreview({
  file,
  setFile
}: {
  file: UploadableFileType
  setFile: (file: UploadableFileType) => void
}) {
  const originalUrl = React.useMemo(
    () => URL.createObjectURL(file.isCompressedVersion && file.altBlob ? file.altBlob : file.blob),
    [file]
  )
  const compressedUrl = React.useMemo(() => {
    if (file.isCompressedVersion) {
      return URL.createObjectURL(file.blob)
    } else if (file.altBlob) {
      return URL.createObjectURL(file.altBlob)
    } else {
      return null
    }
  }, [file])
  const compressedSize = React.useMemo(
    () => (file.isCompressedVersion ? file.blob.size : (file.altBlob?.size ?? null)),
    [file]
  )
  const originalSize = React.useMemo(
    () => (file.isCompressedVersion ? file.altBlob?.size : file.blob.size),
    [file]
  )

  const setIsUsingCompressed = (isUsing: boolean) => {
    if (isUsing !== file.isCompressedVersion) {
      const newFile = produce(file, (draft) => {
        draft.isCompressedVersion = isUsing
        if (file.altBlob) {
          draft.blob = file.altBlob
          draft.altBlob = file.blob
        }
      })
      setFile(newFile)
    }
  }

  return (
    <div className="w-full h-auto flex flex-col gap-4">
      <div className="h-full flex flex-col flex-1 items-center justify-center gap-2 relative">
        <div className="absolute top-0 left-0">
          <Radio
            checked={!file.isCompressedVersion}
            onChange={(_, checked) => checked && setIsUsingCompressed(false)}
          />
        </div>
        <button
          type="button"
          className="cursor-pointer max-h-[300px]"
          onClick={() => setIsUsingCompressed(false)}
        >
          <img src={originalUrl} className="min-h-0 w-full object-contain max-h-[300px]" />
        </button>
        <span className="shrink-0 text-muted">
          {originalSize !== undefined && filesize(originalSize, { locale: getLocale() }).toString()}
        </span>
      </div>
      {compressedUrl !== null && compressedSize !== null ? (
        <div className="h-full flex flex-col flex-1 items-center justify-center gap-2 relative">
          <div className="absolute top-0 left-0">
            <Radio
              checked={file.isCompressedVersion}
              onChange={(_, checked) => checked && setIsUsingCompressed(true)}
            />
          </div>
          <button
            type="button"
            className="cursor-pointer max-h-[300px]"
            onClick={() => setIsUsingCompressed(true)}
          >
            <img src={compressedUrl} className="min-h-0 w-full object-contain max-h-[300px]" />
          </button>
          <span className="shrink-0 text-muted">
            {filesize(compressedSize, { locale: getLocale() }).toString()} (-
            {(
              (((originalSize as number) - compressedSize) / (originalSize as number)) *
              100
            ).toFixed(2)}
            %)
          </span>
        </div>
      ) : (
        <div className="h-full flex-1 flex flex-col items-center justify-center gap-2">
          <div className="flex items-center justify-center flex-1 w-full aspect-square h-auto bg-background-darken">
            <CircularProgress />
          </div>
          <span className="text-muted">Сжатие изображения...</span>
        </div>
      )}
    </div>
  )
}
