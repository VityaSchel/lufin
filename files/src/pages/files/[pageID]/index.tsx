import React from 'react'
import { DownloadFilesInfo } from '$widgets/download-files-info'
import { getFilesPageFromDBDirectly } from '$app/lib/server-utils'
import { FilesPagePasswordInput } from '$widgets/files-page-password-input'
import { DecryptionKeyError } from '$widgets/decryption-key-error'
import { type DecryptionKey, decodeDecryptionKey } from '$shared/utils/files-encryption'
import { type SharedFileForDownload } from '$shared/model/shared-file'
import { DecryptionKeyContext } from '$shared/context/decryption-key'

type Props = ({ files: SharedFileForDownload[] } | { passwordProtected: true }) & { encrypted: boolean }


export default function FilePage() {
  const page: Props = { passwordProtected: true, encrypted: true }

  return <Page page={page} />
}

function Page({ page }: { page: Props }) {
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [files, setFiles] = React.useState<null | SharedFileForDownload[]>(null)
  const [password, setPassword] = React.useState<string | undefined>(undefined)
  const [decryptionKey, setDecryptionKey] = React.useState<null | 'error' | DecryptionKey>(null)

  React.useEffect(() => {
    if ('files' in page) {
      setFiles(page.files)
    }
    setIsLoaded(true)
  }, [page])

  React.useEffect(() => {
    if(page.encrypted) {
      decodeDecryptionKey()
        .then(setDecryptionKey)
    }
  }, [page, setDecryptionKey])

  return (
    <DecryptionKeyContext.Provider value={decryptionKey}>
      {isLoaded && (
        (page.encrypted === false || decryptionKey !== null) && (
          decryptionKey === 'error'
            ? <DecryptionKeyError />
            : (
              files
                ? (
                  <DownloadFilesInfo
                    encrypted={page.encrypted}
                    files={files}
                    password={password}
                    onAbort={() => setDecryptionKey('error')}
                  />
                ) : (
                  'files' in page
                    ? (
                      <DownloadFilesInfo
                        encrypted={page.encrypted}
                        files={page.files}
                        password={password}
                        onAbort={() => setDecryptionKey('error')}
                      />
                    ) : (
                      <FilesPagePasswordInput
                        onSuccess={(files: SharedFileForDownload[], password?: string) => {
                          setFiles(files)
                          setPassword(password)
                        }}
                      />
                    )
                )
            )
        )
      )}
    </DecryptionKeyContext.Provider>
  )
}

// export const getServerSideProps: GetServerSideProps<FilePageProps, { pageID: string }> = async (context) => {
//   const pageID = context.params?.pageID
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
//     const files: SharedFileForDownload[] = filesPage.files.map(file => ({
//       name: file.filename,
//       sizeInBytes: file.filesizeInBytes,
//       mimeType: file.mimeType ?? ''
//     }))

//     return {
//       props: {
//         ...(await serverSideTranslations(context.locale ?? context.defaultLocale ?? 'en', [
//           'filesharing',
//         ])),
//         page: { files, encrypted: filesPage.encrypted }
//       }
//     }
//   }
// }