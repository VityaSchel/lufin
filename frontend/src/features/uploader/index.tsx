import React from 'react'
import styles from './styles.module.scss'
import { type FormikProps, useFormikContext } from 'formik'
import mime from 'mime'
import { Checkbox } from '$shared/ui/components/checkbox'
import { DragNDrop } from '$entities/drag-n-drop'
import { PasswordInput } from '$entities/password-input'
import { FormHelperText } from '@mui/material'
import { removeExifFromJpeg } from '$shared/postprocessing/exif'
import { nanoid } from 'nanoid'
import { UploadableFilesList } from '$features/uploadable-files-list'
import { SubmitFilesButton } from '$features/submit-files-button'
import { m } from '$m'
import { getFileType } from '$shared/utils/get-file-type'
import type { FilesUploaderFormValues, UploadableFile } from '$shared/model/upload-file'
import { compressImage } from '$shared/postprocessing/compress'

export function FilesUploader({
  onSubmit,
  formikRef
}: {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  formikRef: React.MutableRefObject<FormikProps<FilesUploaderFormValues>>
}) {
  const { values, errors, touched, setFieldValue, isSubmitting } =
    useFormikContext<FilesUploaderFormValues>()

  type PostProcessingStep = {
    step: 'exif' | 'compress'
    process: (file: Blob) => Promise<Blob | null>
  }
  type PostProcessFileConfig = {
    fileId: number
    steps: PostProcessingStep[]
  }

  const onAddDroppedItems = async (items: File[]) => {
    const files = items.filter((f) => f.type || f.size % 4096 !== 0)
    const postProcessingPromises: PostProcessFileConfig[] = []
    const newFiles: UploadableFile[] = []
    for (let i = 0; i < files.length; i++) {
      const postProcessingSteps: PostProcessingStep[] = []

      let file = files[i]
      file = new File([file], file.name.normalize(), { type: file.type })
      const initialName = file.name
      const extension = file.name.includes('.')
        ? file.name.split('.').at(-1)
        : mime.getExtension(file.type)
      const newName = nanoid(16) + (extension ? `.${extension}` : '')
      const uploadableFile: UploadableFile = {
        id: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
        content: file,
        fsOriginalName: initialName,
        name: newName,
        type: file.type
      }
      if (file.type === 'image/jpeg') {
        postProcessingSteps.push({
          step: 'exif',
          process: (file) =>
            removeExifFromJpeg(file).then((blob) => blob && new Blob([blob], { type: file.type }))
        })
      }
      if (
        getFileType(file.type, file.name) === 'image' &&
        file.type !== 'image/gif' &&
        file.type !== 'image/webp'
      ) {
        postProcessingSteps.push({ step: 'compress', process: (file) => compressImage(file) })
      }
      if (postProcessingSteps.length > 0) {
        uploadableFile.processing = true
      }

      postProcessingPromises.push({
        fileId: uploadableFile.id,
        steps: postProcessingSteps
      })
      newFiles.push(uploadableFile)
    }

    const existingFiles = formikRef.current.values['files'] || []
    setFieldValue('files', [...existingFiles, ...newFiles])

    await new Promise((r) => setTimeout(r, 0))
    postProcessFiles(postProcessingPromises)
  }

  async function postProcessFiles(postProcessingFiles: PostProcessFileConfig[]) {
    async function processFile({ fileId, steps }: PostProcessFileConfig) {
      const files = formikRef.current.values['files'] || []
      const file = structuredClone(files.find((f) => f.id === fileId))
      if (!file) return null
      let content = file.content
      for (const { step, process } of steps) {
        const newContent = await process(content)
        if (newContent) {
          if (step === 'compress') {
            file.compressed = {
              content: newContent,
              chosen: true
            }
          } else {
            content = newContent
          }
        }
      }
      file.content = content
      file.processing = undefined
      return file
    }

    const promises: { fileId: number; promise: Promise<UploadableFile | null> }[] = []
    for (const file of postProcessingFiles) {
      promises.push({ fileId: file.fileId, promise: processFile(file) })
    }

    for (const { fileId, promise } of promises) {
      const newUploadableFile = await promise
      if (!newUploadableFile) continue
      const files = structuredClone(formikRef.current.values['files'] || [])
      const fileIndex = files.findIndex((f) => f.id === fileId)
      if (fileIndex === -1) continue
      files[fileIndex] = newUploadableFile
      formikRef.current.values['files'] = files
      await setFieldValue('files', files)
    }
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
