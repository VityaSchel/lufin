import React from 'react'
import styles from './styles.module.scss'
import { type FormikProps, useFormikContext } from 'formik'
import mime from 'mime'
import { Checkbox } from '$shared/ui/components/checkbox'
import { DragNDrop } from '$entities/drag-n-drop'
import { PasswordInput } from '$entities/password-input'
import { FormHelperText } from '@mui/material'
import { removeExifFromJpeg } from '$shared/processing/strip-metadata'
import { nanoid } from 'nanoid'
import { UploadableFilesList } from '$features/uploadable-files-list'
import { SubmitFilesButton } from '$features/submit-files-button'
import { m } from '$m'
import { getFileType } from '$shared/utils/get-file-type'
import type { FilesUploaderFormValues, UploadableFile } from '$shared/model/upload-file'
import { compressImage } from '$shared/processing/compress'

export function FilesUploader({
  onSubmit,
  formikRef
}: {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  formikRef: React.MutableRefObject<FormikProps<FilesUploaderFormValues>>
}) {
  const { values, errors, touched, setFieldValue, isSubmitting } =
    useFormikContext<FilesUploaderFormValues>()

  const onAddDroppedItems = async (items: File[]) => {
    const files = items.filter((f) => f.type || f.size % 4096 !== 0)

    const newFiles: UploadableFile[] = []
    for (let i = 0; i < files.length; i++) {
      let file = files[i]
      file = new File([file], file.name.normalize(), { type: file.type })
      if (file.type === 'image/jpeg') {
        try {
          const blob = await removeExifFromJpeg(file)
          file = new File([blob], file.name, { type: file.type })
        } catch (e) {
          console.error('Error while stripping off metadata', file, e)
        }
      }
      const initialName = file.name
      const extension = file.name.includes('.')
        ? file.name.split('.').at(-1)
        : mime.getExtension(file.type)
      const newName = nanoid(16) + (extension ? `.${extension}` : '')
      const uploadableFile: UploadableFile = {
        id: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
        blob: file,
        initialName,
        name: newName,
        type: file.type
      }
      if (
        getFileType(file.type, file.name) === 'image' &&
        file.type !== 'image/gif' &&
        file.type !== 'image/webp'
      ) {
        const compressed = await compressImage(file)
        if (compressed !== null) {
          uploadableFile.altBlob = file
          uploadableFile.blob = compressed
          uploadableFile.isCompressedVersion = true
        } else {
          // uploadableFile.altBlob = file
          // uploadableFile.isCompressedVersion = false
        }
      }
      newFiles.push(uploadableFile)
    }

    const existingFiles = formikRef.current.values['files'] || []
    setFieldValue('files', [...existingFiles, ...newFiles])
  }

  return (
    <form onSubmit={onSubmit} className={styles.uploader}>
      <div className="flex flex-col top-[98px] md:sticky gap-4 flex-1 h-[calc(100vh-188px)]">
        <DragNDrop
          onAddDroppedItems={onAddDroppedItems}
          disabled={isSubmitting}
          key={values.files?.length}
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
    </form>
  )
}
