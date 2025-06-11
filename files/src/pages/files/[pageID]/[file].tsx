import React from 'react'
import { getFilesPageFromDBDirectly } from '$app/lib/server-utils'
import { DecryptionKeyContext } from '$shared/context/decryption-key'
import type { SharedFileForDownload } from '$shared/model/shared-file'
import { type DecryptionKey, decodeDecryptionKey } from '$shared/utils/files-encryption'
import { DecryptionKeyError } from '$widgets/decryption-key-error'
import { DirectLinkFileWidget } from '$widgets/download-direct-file-info'
import { FilesPagePasswordInput } from '$widgets/files-page-password-input'
import { Navigate, replace, useNavigate, useParams } from 'react-router'

type Props = ({ file: SharedFileForDownload } | { passwordProtected: true }) & {
  encrypted: boolean
}

export default function DirectLinkFilePage() {
  const page: Props = { passwordProtected: true, encrypted: true }

  return <Page page={page} />
}

function Page({ page }: { page: Props }) {
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [file, setFile] = React.useState<null | SharedFileForDownload>(null)
  const [password, setPassword] = React.useState<string | undefined>(undefined)
  const [decryptionKey, setDecryptionKey] = React.useState<null | 'error' | DecryptionKey>(null)
  const params = useParams()
  const fileNameOrIndex = (Array.isArray(params.file) ? params.file[0] : params.file) as string

  React.useEffect(() => {
    if ('file' in page) {
      setFile(page.file)
    }
    setIsLoaded(true)
  }, [page])

  React.useEffect(() => {
    if (page.encrypted) {
      decodeDecryptionKey().then(setDecryptionKey)
    }
  }, [setDecryptionKey])

  if (!fileNameOrIndex) {
    return <Navigate to="/404" replace />
  }

  return (
    <DecryptionKeyContext.Provider value={decryptionKey}>
      {isLoaded &&
        (page.encrypted === false || decryptionKey !== null) &&
        (decryptionKey === 'error' ? (
          <DecryptionKeyError />
        ) : file ? (
          <DirectLinkFileWidget
            encrypted={page.encrypted}
            file={file}
            password={password}
            onAbort={() => setDecryptionKey('error')}
          />
        ) : 'file' in page ? (
          <DirectLinkFileWidget
            encrypted={page.encrypted}
            file={page.file}
            password={password}
            onAbort={() => setDecryptionKey('error')}
          />
        ) : (
          <FilesPagePasswordInput
            onSuccess={(files: SharedFileForDownload[], password?: string) => {
              let file = files.find((file) => file.name === fileNameOrIndex)
              if (!file) {
                const index = Number(fileNameOrIndex)
                if (Number.isSafeInteger(index) && index >= 0 && index < files.length) {
                  file = files[index]
                }
              }
              if (!file) {
                return <Navigate to="/404" replace />
              } else {
                setFile(file)
                setPassword(password)
              }
            }}
          />
        ))}
    </DecryptionKeyContext.Provider>
  )
}

// export const getServerSideProps: GetServerSideProps<FilePageProps, { pageID: string, file: string }> = async (context) => {
//   const pageID = context.params?.pageID
//   const fileNameOrIndex = context.params?.file
//   if (!pageID) {
//     return {
//       props: {},
//       notFound: true
//     }
//   }
//   const db = await (await import('$app/db')).getDB()
//   const filesPage = await getFilesPageFromDBDirectly(db, pageID)
//   if (!filesPage) {
//     return {
//       props: {},
//       notFound: true
//     }
//   }

//   if (filesPage.passwordHash !== null) {
//     return {
//       props: {
//         ...(await serverSideTranslations(context.locale ?? context.defaultLocale ?? 'en', [
//           'filesharing',
//         ])),
//         page: { passwordProtected: true, encrypted: filesPage.encrypted }
//       }
//     }
//   } else {
//     let file = filesPage.files.find(f => f.filename === fileNameOrIndex)
//     if (!file) {
//       const fileIndex = Number(fileNameOrIndex)
//       if (Number.isSafeInteger(fileIndex) && fileIndex >= 0 && fileIndex < filesPage.files.length) {
//         file = filesPage.files[fileIndex]
//       }
//       if(!file) {
//         return {
//           props: {},
//           notFound: true
//         }
//       }
//     }

//     const mappedFile: SharedFileForDownload = {
//       name: file.filename,
//       sizeInBytes: file.filesizeInBytes,
//       mimeType: file.mimeType ?? ''
//     }

//     return {
//       props: {
//         ...(await serverSideTranslations(context.locale ?? context.defaultLocale ?? 'en', [
//           'filesharing',
//         ])),
//         page: { file: mappedFile, encrypted: filesPage.encrypted }
//       }
//     }
//   }
// }
