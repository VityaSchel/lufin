import React from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { FilesUploader } from '$features/uploader'
import type { FilesUploaderFormValues } from '$shared/model/files-uploader-values'
import { Formik, type FormikProps } from 'formik'
import { produce } from 'immer'
import { UploadSuccessful } from '$features/upload-successful'
import { onSubmitForm } from '$shared/upload'
import { useComplexState } from '$shared/utils/react-hooks/complex-state'
import { m } from '$m'
import { UploadFilesContext } from '$shared/upload-context'
import { useNavigate } from 'react-router'
import type { Links } from '$shared/upload'

export default function FilesPage() {
  const uploadStrategy: 'sequential' | 'parallel' = 'parallel'

  const [uploadedFiles, setUploadedFiles, uploadedFilesRef] = useComplexState<boolean[]>([])
  const [links, setLinks] = React.useState<Links | null>(null)
  const [uploadRequestProgress, setUploadRequestProgress, uploadRequestProgressRef] =
    useComplexState<number[]>([])
  const navigate = useNavigate()

  const formikRef = React.useRef<FormikProps<FilesUploaderFormValues>>()

  const handleOnFileUploaded = (fileIndex: number) => {
    const files = produce(uploadedFilesRef.current, (draft) => {
      draft[fileIndex] = true
    })
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
    <UploadFilesContext.Provider value={{ uploadedFiles, uploadRequestProgress }}>
      <DndProvider backend={HTML5Backend}>
        <Formik
          initialValues={{
            files: null,
            password: null,
            deleteAtFirstDownload: false,
            convertToZip: false,
            zipArchiveName: null,
            encrypt: true
          }}
          validate={(values: FilesUploaderFormValues) => {
            const errors: Partial<Record<keyof FilesUploaderFormValues, string>> = {}
            if (
              values.deleteAtFirstDownload &&
              values.files &&
              values.files.length > 1 &&
              !values.convertToZip
            ) {
              errors.deleteAtFirstDownload = m.uploadForm_deleteAfterFirstDownloadValidationError()
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
                onGoToMyFiles={() => navigate('/uploads')}
              />
            ) : (
              <FilesUploader onSubmit={handleSubmit} formikRef={formikRef as any} />
            )
          }
        </Formik>
      </DndProvider>
    </UploadFilesContext.Provider>
  )
}
