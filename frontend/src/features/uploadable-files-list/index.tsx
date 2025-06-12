import React from 'react'
import styles from './styles.module.scss'
import cx from 'classnames'
import { useFormikContext } from 'formik'
import type { FilesUploaderFormValues } from '$shared/model/files-uploader-values'
import { UploadableGroupTitle } from '$entities/uploadable-group-title'
import { UploadableFile } from '$entities/uploadable-file'
import { UploadFilesContext } from '$widgets/upload-files-tab/context'
import { produce } from 'immer'
import type { UploadableFile as UploadableFileType } from '$shared/uploadable-file'
import { m } from '$m'
import { filesize } from 'filesize'
import { getLocale } from '$paraglide/runtime'
import * as API from '$app/api'

export function UploadableFilesList() {
  const { values, setFieldValue, isSubmitting } = useFormikContext<FilesUploaderFormValues>()
  const context = React.useContext(UploadFilesContext)
  const [fileSizeLimit, setFileSizeLimit] = React.useState<undefined | number>()

  const sumSizeBytes = React.useMemo(
    () => (values.files ? values.files.reduce((prev, cur) => prev + cur.blob.size, 0) : 0),
    [values.files]
  )

  const sumSizeExceededLimit = fileSizeLimit !== undefined && sumSizeBytes > fileSizeLimit

  const handleRemove = (i: number) => {
    const files = produce(values.files!, (draft) => {
      draft.splice(i, 1)
    })
    setFieldValue('files', files)
  }

  const handleRename = (i: number, newName: string) => {
    const files = produce(values.files!, (draft) => {
      draft[i].name = newName
    })
    setFieldValue('files', files)
  }

  const handleSetFile = (i: number, newFile: UploadableFileType) => {
    const files = produce(values.files!, (draft) => {
      draft[i] = newFile
    })
    setFieldValue('files', files)
  }

  React.useEffect(() => {
    API.getLimits().then((limits) => {
      const maxUploadSize = limits === 'error' ? undefined : limits?.at(-1)?.limit
      if (maxUploadSize !== undefined && maxUploadSize !== Infinity) {
        setFileSizeLimit(maxUploadSize * 1000 * 1000)
      }
    })
  }, [])

  return (
    <>
      <div className={styles.uploadableFilesList}>
        {/* <h3>{m.uploadableFile_title()}</h3> */}
        <div className={cx(styles.outlined, styles.uploadableGroup)}>
          <div className={styles.uploadableGroupTitle}>
            <UploadableGroupTitle disabled={isSubmitting} />
          </div>
          {values.files !== null && (
            <div className={styles.files}>
              {Array.from(values.files).map((file, i) => (
                <UploadableFile
                  setFile={(file) => handleSetFile(i, file)}
                  onRename={(newName: string) => handleRename(i, newName)}
                  onRemove={() => handleRemove(i)}
                  file={file}
                  key={i}
                  disableEditing={isSubmitting}
                  progress={
                    isSubmitting
                      ? context?.uploadedFiles[values.convertToZip ? 0 : i]
                        ? 100
                        : context?.uploadRequestProgress[i]
                          ? context.uploadRequestProgress[i] * 90
                          : 0
                      : null
                  }
                />
              ))}
            </div>
          )}
          {Boolean(!values.files?.length || sumSizeExceededLimit) && (
            <span className={styles.hint}>
              {sumSizeExceededLimit
                ? m.uploadForm_limitExceeded({
                    maxSize: filesize(fileSizeLimit, { locale: getLocale() })
                  })
                : m.uploadForm_dragHere()}
            </span>
          )}
        </div>
      </div>
    </>
  )
}
