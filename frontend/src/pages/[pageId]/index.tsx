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
import { m } from '$m'

export default function FilePage() {
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [files, setFiles] = React.useState<null | SharedFileForDownload[]>(null)
  const [decryptionKey, setDecryptionKey] = React.useState<null | 'error' | DecryptionKey>(null)
  const [pageNotFound, setPageNotFound] = React.useState(false)
  const [encrypted, setEncrypted] = React.useState<boolean>(false)
  const [checksum, setChecksum] = React.useState<string | undefined>()

  const [password, setPassword] = React.useState<string | undefined>(undefined)
  const [passwordError, setPasswordError] = React.useState<string | null>(null)
  const [passwordSubmitting, setPasswordSubmitting] = React.useState<boolean>(false)

  const params = useParams()
  const pageId = params.pageId

  const fetchFiles = (pageId: string, password: string | undefined) => {
    API.getFilesPage(pageId, password)
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
            setChecksum(response.checksum)
          }
          setIsLoaded(true)
        } else {
          if (response.error === 'NOT_FOUND') {
            setPageNotFound(true)
          } else if (response.error === 'PAGE_PASSWORD_PROTECTED') {
            setIsLoaded(true)
          } else if (response.error === 'INVALID_PAGE_PASSWORD') {
            setFiles(null)
            setPasswordError(m.passwordProtection_incorrectPassword())
          }
        }
      })
      .catch((error) => {
        console.error(error)
        if (password) {
          setPasswordError(m.passwordProtection_error())
        }
      })
      .finally(() => {
        setPasswordSubmitting(false)
      })
  }

  React.useEffect(() => {
    setPasswordSubmitting(true)
    if (pageId) fetchFiles(pageId, password)
  }, [pageId, password])

  React.useEffect(() => {
    const onHashChange = () => {
      decodeDecryptionKey({ checksum }).then((key) =>
        setDecryptionKey(key ?? (encrypted ? 'error' : null))
      )
    }
    window.addEventListener('hashchange', onHashChange)
    onHashChange()
    return () => {
      window.removeEventListener('hashchange', onHashChange)
    }
  }, [checksum])

  if (!pageId || pageNotFound) {
    return <PageNotFound />
  }

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
              setPasswordError(null)
              setIsLoaded(true)
              fetchFiles(pageId, password)
            }}
            error={passwordError}
            submitting={passwordSubmitting}
          />
        ))}
    </DecryptionKeyContext.Provider>
  )
}
