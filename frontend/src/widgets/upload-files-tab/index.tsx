import React from 'react'
import styles from './styles.module.scss'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { FilesUploader } from '$features/uploader'
import type { FilesUploaderFormValues } from '$shared/model/files-uploader-values'
import { Formik, type FormikProps } from 'formik'
import clone from 'just-clone'
import { UploadSuccessful } from '$features/upload-successful'
import { onSubmitForm } from '$widgets/upload-files-tab/proc/upload'
import { useComplexState } from '$shared/utils/react-hooks/complex-state'
import { StylesSuspense } from '$shared/ui/styles-suspense'
import { m } from '$m'

export type Links = { download: string; delete: string }
export const UploadFilesContext = React.createContext<
  { uploadedFiles: boolean[]; uploadRequestProgress: number[] } | undefined
>(undefined)

export function UploadFilesTab({
  uploadStrategy,
  onGoToMyFiles
}: {
  uploadStrategy: 'parallel' | 'sequential'
  onGoToMyFiles: () => any
}) {
  const [uploadedFiles, setUploadedFiles, uploadedFilesRef] = useComplexState<boolean[]>([])
  const [links, setLinks] = React.useState<Links | null>(null)
  const [uploadRequestProgress, setUploadRequestProgress, uploadRequestProgressRef] =
    useComplexState<number[]>([])

  const formikRef = React.useRef<FormikProps<FilesUploaderFormValues>>()

  const handleOnFileUploaded = (fileIndex: number) => {
    const files = clone(uploadedFilesRef.current)
    files[fileIndex] = true
    setUploadedFiles(files)
  }

  const handleLinksReady = (links: Links) => {
    setLinks(links)
    setUploadRequestProgress([])
  }

  const handleResetForm = () => {
    setUploadedFiles([])
    setLinks(null)
    formikRef.current?.resetForm()
  }

  const handleFileUploadProgress = (fileIndex: number, progress: number) => {
    const progressArray = clone(uploadRequestProgressRef.current)
    progressArray[fileIndex] = progress
    setUploadRequestProgress(progressArray)
  }

  const handleAllFilesUploadProgress = (progress: number, length?: number) => {
    const progressArray = new Array(length ?? uploadRequestProgressRef.current.length)
    progressArray.fill(progress)
    setUploadRequestProgress(progressArray)
  }

  return (
    <StylesSuspense>
      <UploadFilesContext.Provider value={{ uploadedFiles, uploadRequestProgress }}>
        <div className={styles.uploadFiles}>
          <DndProvider backend={HTML5Backend}>
            <Formik
              initialValues={{
                files: null,
                expiresAt: null,
                password: null,
                deleteAtFirstDownload: false,
                convertToZip: false,
                zipArchiveName: null,
                encrypt: true
              }}
              validate={(values: FilesUploaderFormValues) => {
                const errors: Partial<Record<keyof FilesUploaderFormValues, string>> = {}
                if (values.expiresAt instanceof Date && isNaN(values.expiresAt.getTime())) {
                  errors.expiresAt = m.uploadForm_expirationDateInvalid()
                }
                if (
                  values.deleteAtFirstDownload &&
                  values.files &&
                  values.files.length > 1 &&
                  !values.convertToZip
                ) {
                  errors.deleteAtFirstDownload =
                    m.uploadForm_deleteAfterFirstDownloadValidationError()
                }
                return errors
              }}
              onSubmit={(values: FilesUploaderFormValues) => {
                setUploadedFiles([])
                return onSubmitForm({
                  values,
                  uploadStrategy,
                  callbacks: {
                    onFileUploaded: handleOnFileUploaded,
                    onLinksReady: handleLinksReady,
                    setUploadRequestProgress: handleFileUploadProgress,
                    setUploadRequestProgressForAll: handleAllFilesUploadProgress
                  }
                })
              }}
              innerRef={formikRef as any}
            >
              {({ values, handleSubmit }) =>
                links && values.files ? (
                  <UploadSuccessful
                    filesNum={values.files.length}
                    links={links}
                    password={values.password}
                    onResetForm={() => handleResetForm()}
                    onGoToMyFiles={() => onGoToMyFiles()}
                  />
                ) : (
                  <form onSubmit={handleSubmit}>
                    <FilesUploader formikRef={formikRef as any} />
                  </form>
                )
              }
            </Formik>
          </DndProvider>
        </div>
      </UploadFilesContext.Provider>
    </StylesSuspense>
  )
}
