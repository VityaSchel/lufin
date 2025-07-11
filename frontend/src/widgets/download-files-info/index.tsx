import React, { useContext } from 'react'
import styles from './styles.module.scss'
import { Headline } from '$entities/headline'
import plural from 'plural-ru'
import byteSize from 'byte-size'
import { SharedFile } from '$features/shared-file'
import { Button } from '$shared/ui/components/button'
import { produce } from 'immer'
import { CircularProgress } from '@mui/material'
import saveAs from 'file-saver'
import { type DecryptionKey, decryptFile } from '$shared/utils/files-encryption'
import { downloadFile } from '$shared/download'
import { getFileType } from '$shared/utils/get-file-type'
import { useComplexState } from '$shared/utils/react-hooks/complex-state'
import { DecryptionKeyContext } from '$shared/context/decryption-key'
import { type SharedFileForDownload } from '$shared/model/shared-file'
import { m } from '$m'
import { useParams } from 'react-router'

export function DownloadFilesInfo({
  encrypted,
  password,
  files,
  onAbort
}: {
  encrypted: boolean
  password?: string
  files: SharedFileForDownload[]
  onAbort: () => any
}) {
  const decryptionKey = useContext(DecryptionKeyContext) as DecryptionKey
  const pageId = useParams().pageId
  if (typeof pageId !== 'string') throw new Error('PageId param is invalid')

  const [fileIndexesDlProgress, setFileIndexesDlProgress, fileIndexesDlProgress_] = useComplexState<
    (number | void)[]
  >([])
  const [fileContents, setFileContents, fileContents_] = useComplexState<Blob[]>([])
  const [erroredIndexes, setErroredIndexes, erroredIndexes_] = useComplexState<boolean[]>([])

  const erroredFilesNum = erroredIndexes.filter((i) => Boolean(i)).length
  const downloadedFilesNum = fileContents.length
  const startedDlFilesNum = fileIndexesDlProgress.filter((i) => typeof i === 'number').length

  const downloadingFilesNum = startedDlFilesNum - fileContents.length - erroredFilesNum
  const remainingForDownload = files.length - (startedDlFilesNum - erroredFilesNum)
  const isDownloadingAll = remainingForDownload === 0
  const isDownloadedAll = files.length - downloadedFilesNum === 0

  const handleDownloadProgress = (i: number, progress: number) => {
    const dlProgress = produce(fileIndexesDlProgress_.current, (draft) => {
      draft[i] = progress
    })
    setFileIndexesDlProgress(dlProgress)
  }

  const handleStartDownloading = async (fileName: string, i: number) => {
    const dlStatus = produce(fileIndexesDlProgress_.current, (draft) => {
      draft[i] = 0
    })
    setFileIndexesDlProgress(dlStatus)

    const errored = produce(erroredIndexes_.current, (draft) => {
      draft[i] = false
    })
    setErroredIndexes(errored)

    const downloadStart = Date.now()

    try {
      return await downloadFile(
        pageId,
        fileName,
        {
          onDownloaded: (file) => handleDownloaded(i, file),
          onProgress: (progress) => handleDownloadProgress(i, progress)
        },
        { password }
      )
    } catch (e) {
      console.error('Error while downloading file', e)

      const erroredIndexes = produce(erroredIndexes_.current, (draft) => {
        draft[i] = true
      })
      setErroredIndexes(erroredIndexes)

      setTimeout(
        () =>
          alert(
            m.networkError() +
              '\n\n' +
              (e instanceof Error
                ? e.message
                : typeof e === 'object' && e !== null && 'toString' in e
                  ? e.toString()
                  : String(e)) +
              '\nDownload time: ' +
              (Date.now() - downloadStart) +
              'ms'
          ),
        1
      )

      return false
    }
  }

  const sharedFileComponentRefs = React.useRef<{ triggerPreview: () => any }[]>([])
  const handleDownloadStarted = async (
    fileName: string,
    i: number,
    endedCallback?: 'SAVE' | 'PREVIEW'
  ) => {
    const alreadyBeingDownloaded = typeof fileIndexesDlProgress_.current[i] === 'number'
    if (alreadyBeingDownloaded) return

    const downloadResult = await handleStartDownloading(fileName, i)
    if (downloadResult && endedCallback) {
      if (endedCallback === 'PREVIEW') {
        sharedFileComponentRefs.current[i]?.triggerPreview()
      } else if (endedCallback === 'SAVE') {
        saveFile(downloadResult, i)
      }
    }
  }

  const handleDownloaded = async (i: number, content: Blob) => {
    try {
      let resultingFile: Blob
      if (encrypted) {
        const buf = await decryptFile(decryptionKey, content)
        resultingFile = new Blob([buf], { type: files[i].mimeType })
      } else {
        resultingFile = new Blob([content], { type: files[i].mimeType })
      }
      const contents = produce(fileContents_.current, (draft) => {
        draft[i] = resultingFile
      })
      setFileContents(contents)
      return resultingFile
    } catch (e) {
      const erroredIndexes = produce(erroredIndexes_.current, (draft) => {
        draft[i] = true
      })
      setErroredIndexes(erroredIndexes)
      console.error(e)
      onAbort()
      return false
    }
  }

  const handleSave = (i: number) => {
    saveFile(fileContents[i], i)
  }

  const saveFile = (content: Blob, i: number) => {
    const fileData = new File([content], files[i].name)
    saveAs(fileData)
  }

  const handleDownloadAll = async () => {
    for (let i = 0; i < files.length; i++) {
      handleStartDownloading(files[i].name, i)
      await new Promise((resolve) => setTimeout(resolve, 1))
    }
  }

  const handleSaveAll = async () => {
    const JSZip = await import('jszip').then((mod) => mod.default)
    const archive = new JSZip()
    for (let i = 0; i < files.length; i++) {
      const fileData = new File([fileContents[i]], files[i].name)
      archive.file(files[i].name, fileData)
    }

    const zipBlob = await archive.generateAsync({ type: 'blob' })
    saveAs(zipBlob, 'files.zip')
  }

  const openPreviousPreview = (i: number): undefined | (() => any) => {
    if (i === 0) return undefined
    const imagesFiles = files.map((f) => getFileType(f.mimeType, f.name)).slice(0, i)
    if (imagesFiles.includes('image')) {
      return () => sharedFileComponentRefs.current[i - 1].triggerPreview()
    } else {
      return undefined
    }
  }

  const openNextPreview = (i: number): undefined | (() => any) => {
    if (i === files.length - 1) return undefined
    const imagesFiles = files.map((f) => getFileType(f.mimeType, f.name)).slice(i + 1)
    if (imagesFiles.includes('image')) {
      return () => sharedFileComponentRefs.current[i + 1].triggerPreview()
    } else {
      return undefined
    }
  }

  return (
    <section className={styles.fileInfo}>
      {files.length > 1 && (
        <>
          <Headline>
            {files.length}{' '}
            {plural(
              files.length,
              m.filesGenitive_one(),
              m.filesGenitive_few(),
              m.filesGenitive_many()
            )}
          </Headline>
          <span className={styles.size}>
            {byteSize(
              files.length > 1
                ? files.reduce((prev, cur) => prev + cur.sizeInBytes, 0)
                : files[0].sizeInBytes
            ).toString()}
          </span>
          {isDownloadedAll ? (
            <Button
              onClick={() => handleSaveAll()}
              disabled={downloadedFilesNum - erroredFilesNum === 0}
            >
              {m.download()} {files.length}{' '}
              {plural(
                files.length,
                m.filesGenitive_one(),
                m.filesGenitive_few(),
                m.filesGenitive_many()
              )}
            </Button>
          ) : (
            <Button
              disabled={isDownloadingAll || isDownloadedAll}
              onClick={() => handleDownloadAll()}
              className={styles.downloadAllButton}
            >
              {isDownloadingAll ? (
                <>
                  <CircularProgress size={30} thickness={5} className={styles.spinner} />
                  <span className={styles.offsetLabel}>
                    {m.loading()} {downloadingFilesNum}{' '}
                    {plural(
                      downloadingFilesNum,
                      m.filesGenitive_one(),
                      m.filesGenitive_few(),
                      m.filesGenitive_many()
                    )}
                  </span>
                </>
              ) : (
                `${m.download()} ${startedDlFilesNum === 0 ? m.loadEverything() : `${remainingForDownload} ${plural(remainingForDownload, m.filesGenitive_one(), m.filesGenitive_few(), m.filesGenitive_many())}`}`
              )}
            </Button>
          )}
        </>
      )}
      <div className={styles.files}>
        {files.map((file, i) => (
          <SharedFile
            ref={(el: (typeof sharedFileComponentRefs.current)[number]) =>
              (sharedFileComponentRefs.current[i] = el)
            }
            passwordProtected={Boolean(password)}
            pageId={pageId}
            isErrored={erroredIndexes[i] ?? false}
            downloadProgress={fileIndexesDlProgress[i] ?? false}
            onDownloadStarted={(onEndCallbackType) =>
              handleDownloadStarted(file.name, i, onEndCallbackType)
            }
            onSave={() => handleSave(i)}
            content={fileContents[i]}
            file={file}
            encrypted={encrypted}
            key={i}
            i={i}
            onOpenPreviousPreview={openPreviousPreview(i)}
            onOpenNextPreview={openNextPreview(i)}
          />
        ))}
      </div>
    </section>
  )
}
