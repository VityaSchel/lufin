import React from 'react'
import { DownloadFilesInfo } from '$widgets/download-files-info'
import { FilesPagePasswordInput } from '$widgets/files-page-password-input'
import { DecryptionKeyError } from '$widgets/decryption-key-error'
import { type DecryptionKey, decodeDecryptionKey } from '$shared/utils/files-encryption'
import { type SharedFileForDownload } from '$shared/model/shared-file'
import { DecryptionKeyContext } from '$shared/context/decryption-key'
import { useParams } from 'react-router'
import * as API from '$app/api'
import PageNotFound from '$pages/404'

export default function FilePage() {
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [files, setFiles] = React.useState<null | SharedFileForDownload[]>(null)
  const [decryptionKey, setDecryptionKey] = React.useState<null | 'error' | DecryptionKey>(null)
  const [pageNotFound, setPageNotFound] = React.useState(false)
  const [encrypted, setEncrypted] = React.useState<boolean>(false)

  const [password, setPassword] = React.useState<string | undefined>(undefined)
  const [passwordError, setPasswordError] = React.useState<boolean>(false)
  const [passwordSubmitting, setPasswordSubmitting] = React.useState<boolean>(false)

  const params = useParams()
  const pageID = params.pageID

  if (!pageID || pageNotFound) {
    return <PageNotFound />
  }

  React.useEffect(() => {
    setPasswordSubmitting(true)
    API.getFilesPage(pageID, password)
      .then((response) => {
        if (response.ok) {
          setFiles(
            response.files.map((file) => ({
              name: file.filename,
              sizeInBytes: file.sizeInBytes,
              mimeType: file.mimeType ?? ''
            }))
          )
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
            setFiles(null)
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
        ) : files ? (
          <DownloadFilesInfo
            encrypted={encrypted}
            files={files}
            password={password}
            onAbort={() => setDecryptionKey('error')}
          />
        ) : (
          <FilesPagePasswordInput
            onSubmit={(password) => {
              setPassword(password)
              setPasswordError(false)
              setIsLoaded(true)
            }}
            error={passwordError}
            submitting={passwordSubmitting}
          />
        ))}
    </DecryptionKeyContext.Provider>
  )
}
