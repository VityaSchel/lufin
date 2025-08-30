import React from 'react'
import styles from './styles.module.scss'
import cx from 'classnames'
import { Collapse, Fade, IconButton, Radio, Skeleton, useMediaQuery } from '@mui/material'
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
import type {
  CompressedUploadableFile,
  UploadableFile as UploadableFileType
} from '$shared/model/upload-file'
import { m } from '$m'
import { getLocale } from '$paraglide/runtime'

export function UploadableFile({
  file,
  setIsChosenCompressedVersion,
  onRemove,
  onRename,
  disableEditing,
  progress
}: {
  file: UploadableFileType
  setIsChosenCompressedVersion: (args: {
    fileId: UploadableFileType['id']
    isChosen: boolean
  }) => void
  onRename: (newFilename: string) => any
  onRemove: () => any
  disableEditing: boolean
  progress: number | null
}) {
  const [previewOpen, setPreviewOpen] = React.useState(false)
  const isMobile = !useMediaQuery('(min-width: 768px)')

  const fileType = React.useMemo(() => getFileType(file.type, file.name), [file])
  const icon = getSvgIconByFileType(fileType)
  const previewAvailable = fileType && previewSupportedMimeTypes.includes(fileType)

  return (
    <>
      <Fade in={true}>
        <Collapse orientation="vertical" in={true}>
          <div className={cx(styles.outlined, styles.file)}>
            {file.processing && (
              <Skeleton
                variant="rectangular"
                animation="wave"
                className="top-0 left-0 !w-full !h-full !absolute"
              />
            )}
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
                      placeholder={file.fsOriginalName}
                      readonly={disableEditing}
                    />
                  }
                  subtitle={byteSize(
                    (file.compressed?.chosen ? file.compressed.content : file.content).size
                  ).toString()}
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
                      [styles.smallPreview]: fileType === 'audio' || fileType === 'archive'
                    })}
                  >
                    {fileType === 'image' &&
                    file.type !== 'image/gif' &&
                    file.type !== 'image/webp' &&
                    file.compressed ? (
                      <UploadableImageCompressedPreview
                        file={{ ...file, compressed: file.compressed }}
                        setIsChosenCompressedVersion={(isChosen) => {
                          setIsChosenCompressedVersion({ fileId: file.id, isChosen })
                        }}
                      />
                    ) : (
                      <FileContentPreview
                        file={new File([file.content], file.name, { type: file.type })}
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
  setIsChosenCompressedVersion
}: {
  file: UploadableFileType & { compressed: CompressedUploadableFile }
  setIsChosenCompressedVersion: (isChosen: boolean) => void
}) {
  const originalUrl = React.useMemo(() => URL.createObjectURL(file.content), [file.content])
  const compressedUrl = React.useMemo(
    () => URL.createObjectURL(file.compressed.content),
    [file.compressed.content]
  )
  const originalSize = React.useMemo(() => file.content.size, [file])
  const compressedSize = React.useMemo(() => file.compressed.content.size, [file])

  return (
    <div className="w-full h-auto flex flex-col gap-4">
      <div className="h-full flex flex-col flex-1 items-center justify-center gap-2 relative">
        <div className="absolute top-0 left-0">
          <Radio
            checked={!file.compressed.chosen}
            onChange={(_, checked) => checked && setIsChosenCompressedVersion(false)}
          />
        </div>
        <button
          type="button"
          className="cursor-pointer max-h-[300px]"
          onClick={() => setIsChosenCompressedVersion(false)}
        >
          <img src={originalUrl} className="min-h-0 w-full object-contain max-h-[300px]" />
        </button>
        <span className="shrink-0 text-muted">
          {originalSize !== undefined && filesize(originalSize, { locale: getLocale() }).toString()}
        </span>
      </div>
      <div className="h-full flex flex-col flex-1 items-center justify-center gap-2 relative">
        <div className="absolute top-0 left-0">
          <Radio
            checked={file.compressed.chosen}
            onChange={(_, checked) => checked && setIsChosenCompressedVersion(true)}
          />
        </div>
        <button
          type="button"
          className="cursor-pointer max-h-[300px]"
          onClick={() => setIsChosenCompressedVersion(true)}
        >
          <img src={compressedUrl} className="min-h-0 w-full object-contain max-h-[300px]" />
        </button>
        <span className="shrink-0 text-muted">
          {filesize(compressedSize, { locale: getLocale() }).toString()} (-
          {((((originalSize as number) - compressedSize) / (originalSize as number)) * 100).toFixed(
            2
          )}
          %)
        </span>
      </div>
    </div>
  )
}
