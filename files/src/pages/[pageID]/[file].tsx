import React from 'react'
import { DecryptionKeyContext } from '$shared/context/decryption-key'
import type { SharedFileForDownload } from '$shared/model/shared-file'
import { type DecryptionKey, decodeDecryptionKey } from '$shared/utils/files-encryption'
import { DecryptionKeyError } from '$widgets/decryption-key-error'
import { DirectLinkFileWidget } from '$widgets/download-direct-file-info'
import { FilesPagePasswordInput } from '$widgets/files-page-password-input'
import { useParams } from 'react-router'
import * as API from '$app/api'
import PageNotFound from '$pages/404'

export default function DirectFilePage() {
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [file, setFile] = React.useState<null | SharedFileForDownload>(null)
  const [decryptionKey, setDecryptionKey] = React.useState<null | 'error' | DecryptionKey>(null)
  const [pageNotFound, setPageNotFound] = React.useState(false)
  const [encrypted, setEncrypted] = React.useState<boolean>(false)

  const [password, setPassword] = React.useState<string | undefined>(undefined)
  const [passwordError, setPasswordError] = React.useState<boolean>(false)
  const [passwordSubmitting, setPasswordSubmitting] = React.useState<boolean>(false)

  const params = useParams()
  const pageID = params.pageID
  const fileNameOrIndex = params.file

  if (!pageID || !fileNameOrIndex || pageNotFound) {
    return <PageNotFound />
  }

  React.useEffect(() => {
    setPasswordSubmitting(true)
    API.getFilesPage(pageID, password)
      .then((response) => {
        if (response.ok) {
          let file = response.files.find((f) => f.filename === fileNameOrIndex)
          if (!file) {
            const fileIndex = Number(fileNameOrIndex)
            if (
              Number.isSafeInteger(fileIndex) &&
              fileIndex >= 0 &&
              fileIndex < response.files.length
            ) {
              file = response.files[fileIndex]
            }
            if (!file) {
              return setPageNotFound(true)
            }
          }
          setFile({
            name: file.filename,
            sizeInBytes: file.sizeInBytes,
            mimeType: file.mimeType ?? ''
          })
          if (response.encrypted) {
            setEncrypted(true)
            decodeDecryptionKey().then(setDecryptionKey)
          }
        } else {
          if (response.error === 'PAGE_NOT_FOUND') {
            setPageNotFound(true)
          } else if (response.error === 'PAGE_PASSWORD_PROTECTED') {
            setIsLoaded(true)
          } else if (response.error === 'PASSWORD_INVALID') {
            setFile(null)
            setPasswordError(true)
          }
        }
      })
      .finally(() => {
        setPasswordSubmitting(false)
      })
  }, [pageID, password])

  return (
    <DecryptionKeyContext.Provider value={decryptionKey}>
      {isLoaded &&
        (encrypted === false || decryptionKey !== null) &&
        (decryptionKey === 'error' ? (
          <DecryptionKeyError />
        ) : file ? (
          <DirectLinkFileWidget
            encrypted={encrypted}
            file={file}
            password={password}
            onAbort={() => setDecryptionKey('error')}
          />
        ) : (
          <FilesPagePasswordInput
            onSubmit={setPassword}
            error={passwordError}
            submitting={passwordSubmitting}
          />
        ))}
    </DecryptionKeyContext.Provider>
  )
}
