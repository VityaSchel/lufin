import React from 'react'
import styles from './styles.module.scss'
import { type FormikProps, useFormikContext } from 'formik'
import cx from 'classnames'
import { Checkbox } from '$shared/ui/components/checkbox'
import { TextField } from '$shared/ui/components/text-field'
import { DragNDrop } from '$entities/drag-n-drop'
import { PasswordInput } from '$entities/password-input'
import type { FilesUploaderFormValues } from '$shared/model/files-uploader-values'
import { Collapse, FormHelperText } from '@mui/material'
import { isThisAFile } from '$shared/utils/is-this-file'
import { stripMetadata } from '$shared/utils/strip-metadata'
import { getRandomFileName, normalizeFileFilename } from '$shared/utils/normalize-file-name'
import mime from 'mime'
import { UploadableFilesList } from '$features/uploadable-files-list'
import { SubmitFilesButton } from '$features/submit-files-button'
import type { UploadableFile } from '$shared/uploadable-file'
import { m } from '$m'
import { getFileType } from '$shared/utils/get-file-type'
import ImageCompressor from 'compressorjs'
import { produce } from 'immer'

export function FilesUploader({
  formikRef
}: {
  formikRef: React.MutableRefObject<FormikProps<FilesUploaderFormValues>>
}) {
  const { values, errors, touched, setFieldValue, isSubmitting } =
    useFormikContext<FilesUploaderFormValues>()

  return (
    <div className={styles.uploader}>
      <div className="flex flex-col md:self-start top-[26px] md:sticky gap-4 h-all flex-1">
        <DragNDrop
          onChange={async (newEntries) => {
            if (newEntries && !isSubmitting) {
              const newFiles: File[] = []
              for (const file of newEntries) {
                if (await isThisAFile(file)) {
                  newFiles.push(file)
                }
              }
              if (newFiles.length === 0) return

              const metadataFreeNewFiles = await stripMetadata(newFiles)
              const normalizedFilenamesFiles = metadataFreeNewFiles.map((f) =>
                normalizeFileFilename(f)
              )
              const randomizedFilenamesFiles = normalizedFilenamesFiles.map((f, i) => {
                const extension = f.name.includes('.')
                  ? f.name.split('.').at(-1)
                  : mime.getExtension(f.type)
                const name = getRandomFileName(extension || undefined)
                return {
                  id: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
                  blob: f,
                  initialName: normalizedFilenamesFiles[i].name,
                  name,
                  type: f.type
                } satisfies UploadableFile
              })
              randomizedFilenamesFiles
                .filter(
                  (f) =>
                    getFileType(f.type, f.name) === 'image' &&
                    f.type !== 'image/gif' &&
                    f.type !== 'image/webp'
                )
                .forEach((img) => {
                  new ImageCompressor(img.blob, {
                    quality: 0.5,
                    success: (file) => {
                      const newFiles = produce(formikRef.current.values['files'], (draft) => {
                        if (draft) {
                          const fileObject = draft.find((f) => f.id === img.id)
                          if (fileObject && fileObject.blob.size > file.size) {
                            fileObject.altBlob = fileObject.blob
                            fileObject.blob = file
                            fileObject.isCompressedVersion = true
                          }
                        }
                      })
                      setFieldValue('files', newFiles)
                    },
                    error: (err) => {
                      console.error('Image compression failed:', err)
                      const newFiles = produce(formikRef.current.values['files'], (draft) => {
                        if (draft) {
                          const fileObject = draft.find((f) => f.id === img.id)
                          if (fileObject) {
                            fileObject.altBlob = fileObject.blob
                            fileObject.isCompressedVersion = false
                          }
                        }
                      })
                      setFieldValue('files', newFiles)
                    }
                  })
                })
              setFieldValue(
                'files',
                (formikRef.current.values['files'] ?? []).concat(...randomizedFilenamesFiles)
              )
            }
          }}
          key={values.files?.length}
          disabled={isSubmitting}
        />
        <div className="hidden md:flex">
          <SubmitFilesButton />
        </div>
      </div>
      <div className="block md:hidden">
        <UploadableFilesList />
      </div>
      <div className={styles.rightCol}>
        <div className={styles.fields}>
          {/* <ExpiryDatePicker
            value={values.expiresAt}
            error={errors.expiresAt}
            onChange={newDate => setFieldValue('expiresAt', newDate)}
            disabled={isSubmitting}
            max={getMaxExpiration(filesSumSize)}
          /> */}
          <PasswordInput
            value={values.password ?? ''}
            onChange={(newPassword) => setFieldValue('password', newPassword || null)}
            disabled={isSubmitting}
            autoComplete="new-password"
          />
          {errors.password && touched.password && errors.password}
        </div>
        <div className={styles.checkboxes}>
          <div className={styles.checkboxContainer}>
            <Checkbox
              name={'deleteAtFirstDownload'}
              value={values.deleteAtFirstDownload}
              onChange={(isChecked) => setFieldValue('deleteAtFirstDownload', isChecked)}
              disabled={isSubmitting}
            >
              {m.uploadForm_deleteAfterFirstDownloadCheckbox()}
            </Checkbox>
            {errors.deleteAtFirstDownload && (
              <FormHelperText error>{errors.deleteAtFirstDownload}</FormHelperText>
            )}
          </div>
          <div className="flex flex-col">
            <Checkbox
              name="convertToZip"
              value={values.convertToZip}
              onChange={(isChecked) => setFieldValue('convertToZip', isChecked)}
              disabled={isSubmitting}
            >
              {m.uploadForm_uploadAsZipCheckbox()}
            </Checkbox>
            <Collapse orientation="vertical" in={values.convertToZip}>
              <TextField
                onClear={() => {
                  setFieldValue('zipArchiveName', '')
                }}
                value={values.zipArchiveName ?? ''}
                onChange={({ target: { value } }) => setFieldValue('zipArchiveName', value)}
                variant="outlined"
                label={m.uploadForm_zipNameInput()}
                placeholder="documents.zip"
                type="zipArchiveName"
                disabled={isSubmitting}
                className="mt-2"
              />
            </Collapse>
          </div>
          <div className="flex flex-col">
            <Checkbox
              name="encrypt"
              value={values.encrypt}
              onChange={(isChecked) => setFieldValue('encrypt', isChecked)}
              disabled={isSubmitting}
            >
              {m.uploadForm_encryptCheckbox()}
            </Checkbox>
            <span className="text-neutral-500 text-sm ml-7">
              {m.uploadForm_encryptCheckboxHint()}
            </span>
          </div>
        </div>
        <div className="hidden md:flex flex-1 flex-col">
          <UploadableFilesList />
        </div>
        <div className="flex md:hidden">
          <SubmitFilesButton />
        </div>
      </div>
    </div>
  )
}
