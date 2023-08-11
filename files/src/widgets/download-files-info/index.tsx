import React, { useContext } from 'react'
import styles from './styles.module.scss'
import { Headline } from '@/entities/headline'
import plural from 'plural-ru'
import byteSize from 'byte-size'
import { SharedFile } from '@/features/shared-file'
import { Button } from '@/shared/ui/components/button'
import clone from 'just-clone'
import { CircularProgress } from '@mui/material'
import saveAs from 'file-saver'
import { useRouter } from 'next/router'
import { DecryptionKey, decryptFile } from '@/shared/utils/files-encryption'
import { downloadFile } from '@/shared/download'
import { getFileType } from '@/shared/utils/get-file-type'
import { useComplexState } from '@/shared/utils/react-hooks/complex-state'
import { DecryptionKeyContext } from '@/shared/context/decryption-key'
import { SharedFileForDownload } from '@/shared/model/shared-file'
import { useTranslation } from 'next-i18next'
import JSZip from 'jszip'

export function DownloadFilesInfo({ encrypted, password, files, onAbort }: {
  encrypted: boolean
  password?: string
  files: SharedFileForDownload[]
  onAbort: () => any
}) {
  const { t } = useTranslation('filesharing')
  
  const decryptionKey = useContext(DecryptionKeyContext) as DecryptionKey
  const router = useRouter()
  const pageID = router.query.pageID as string

  const [fileIndexesDlProgress, setFileIndexesDlProgress, fileIndexesDlProgress_] = useComplexState<(number | void)[]>([])
  const [fileContents, setFileContents, fileContents_] = useComplexState<Blob[]>([])
  const [erroredIndexes, setErroredIndexes, erroredIndexes_] = useComplexState<boolean[]>([])

  const erroredFilesNum = erroredIndexes.filter(i => Boolean(i)).length
  const downloadedFilesNum = fileContents.length
  const startedDlFilesNum = fileIndexesDlProgress.filter(i => typeof i === 'number').length
  
  const downloadingFilesNum = startedDlFilesNum - fileContents.length - erroredFilesNum
  const remainingForDownload = files.length - (startedDlFilesNum - erroredFilesNum)
  const isDownloadingAll = remainingForDownload === 0
  const isDownloadedAll = files.length - downloadedFilesNum === 0

  const handleDownloadProgress = (i: number, progress: number) => {
    const dlProgress = clone(fileIndexesDlProgress_.current)
    dlProgress[i] = progress
    setFileIndexesDlProgress(dlProgress)
  }

  const handleStartDownloading = async (fileName: string, i: number) => {
    const dlStatus = clone(fileIndexesDlProgress_.current)
    dlStatus[i] = 0
    setFileIndexesDlProgress(dlStatus)

    const errored = clone(erroredIndexes_.current)
    errored[i] = false
    setErroredIndexes(errored)

    const downloadStart = Date.now()

    try {
      const pageID = router.query.pageID
      if (typeof pageID !== 'string') throw new Error('PageID param is invalid')
      return await downloadFile(
        pageID, 
        fileName, 
        {
          onDownloaded: (file) => handleDownloaded(i, file),
          onProgress: (progress) => handleDownloadProgress(i, progress)
        }, 
        { password }
      )
    } catch(e) {
      console.error('Error while downloading file', e)

      const erroredIndexes = clone(erroredIndexes_.current)
      erroredIndexes[i] = true
      setErroredIndexes(erroredIndexes)

      setTimeout(() => alert(t('network_error') + '\n\n' + (
        (e instanceof Error
          ? e.message
          : (typeof e === 'object' && e !== null && 'toString' in e) ? e.toString() : String(e)))
        + '\nDownload time: ' + (Date.now() - downloadStart) + 'ms'),
      1
      )

      return false
    }
  }

  const sharedFileComponentRefs = React.useRef<{ triggerPreview: () => any }[]>([])
  const handleDownloadStarted = async (fileName: string, i: number, endedCallback?: 'SAVE' | 'PREVIEW') => {
    const alreadyBeingDownloaded = typeof fileIndexesDlProgress_.current[i] === 'number'
    if (alreadyBeingDownloaded) return

    const downloadResult = await handleStartDownloading(fileName, i)
    if (downloadResult && endedCallback) {
      if (endedCallback === 'PREVIEW') {
        sharedFileComponentRefs.current[i]?.triggerPreview()
      } else if(endedCallback === 'SAVE') {
        saveFile(downloadResult, i)
      }
    }
  }

  const handleDownloaded = async (i: number, content: Blob) => {
    try {
      let resultingFile: Blob
      if(encrypted) {
        const buf = await decryptFile(decryptionKey, content)
        resultingFile = new Blob([buf], { type: files[i].mimeType })
      } else {
        resultingFile = new Blob([content], { type: files[i].mimeType })
      }
      const contents = clone(fileContents_.current)
      contents[i] = resultingFile
      setFileContents(contents)
      return resultingFile
    } catch(e) {
      const erroredIndexes = clone(erroredIndexes_.current)
      erroredIndexes[i] = true
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
    for(let i = 0; i < files.length; i++) {
      handleStartDownloading(files[i].name, i)
      await new Promise(resolve => setTimeout(resolve, 1))
    }
  }

  const handleSaveAll = async () => {
    const archive = new JSZip()
    for (let i = 0; i < files.length; i++) {
      const fileData = new File([fileContents[i]], files[i].name)
      archive.file(files[i].name, fileData)
    }

    const zipBlob = await archive.generateAsync({ type: 'blob' })
    saveAs(zipBlob, 'files.zip')
  }

  const openPreviousPreview = (i: number): undefined | (() => any) => {
    if(i === 0) return undefined
    const imagesFiles = files.map(f => getFileType(f.mimeType, f.name))
      .slice(0, i)
    if (imagesFiles.includes('image')) {
      return () => sharedFileComponentRefs.current[i-1].triggerPreview()
    } else {
      return undefined
    }
  }

  const openNextPreview = (i: number): undefined | (() => any) => {
    if (i === files.length - 1) return undefined
    const imagesFiles = files.map(f => getFileType(f.mimeType, f.name))
      .slice(i+1)
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
          <Headline>{files.length} {plural(files.length, t('files_genitive.one'), t('files_genitive.few'), t('files_genitive.many'))}</Headline>
          <span className={styles.size}>
            {byteSize(files.length > 1 
              ? files.reduce((prev, cur) => prev + cur.sizeInBytes, 0) 
              : files[0].sizeInBytes
            ).toString()}
          </span>
          {isDownloadedAll ? (
            <Button
              onClick={() => handleSaveAll()}
              disabled={downloadedFilesNum - erroredFilesNum === 0}
            >
              {t('download')} {files.length} {plural(files.length, t('files_genitive.one'), t('files_genitive.few'), t('files_genitive.many'))}
            </Button>
          ) : (
            <Button 
              disabled={isDownloadingAll || isDownloadedAll}
              onClick={() => handleDownloadAll()}
              className={styles.downloadAllButton}
            >
              {isDownloadingAll
                ? (
                  <>
                    <CircularProgress size={30} thickness={5} className={styles.spinner} /> 
                    <span className={styles.offsetLabel}>{t('loading')} {downloadingFilesNum} {plural(downloadingFilesNum, t('files_genitive.one'), t('files_genitive.few'), t('files_genitive.many'))}</span>
                  </>
                ) : `${t('download')} ${startedDlFilesNum === 0 ? t('load_everything') : `${remainingForDownload} ${plural(remainingForDownload, t('files_genitive.one'), t('files_genitive.few'), t('files_genitive.many'))}`}`
              }
            </Button>
          )}
        </>
      )}
      <div className={styles.files}>
        {files.map((file, i) => (
          <SharedFile
            // @ts-expect-error ref is not a valid prop
            ref={(el: typeof sharedFileComponentRefs.current[number]) => sharedFileComponentRefs.current[i] = el}
            pageID={pageID}
            isErrored={erroredIndexes[i] ?? false}
            downloadProgress={fileIndexesDlProgress[i] ?? false}
            onDownloadStarted={(onEndCallbackType) => handleDownloadStarted(file.name, i, onEndCallbackType)}
            onSave={() => handleSave(i)}
            content={fileContents[i]}
            file={file}
            encrypted={encrypted}
            key={i} i={i}
            onOpenPreviousPreview={openPreviousPreview(i)}
            onOpenNextPreview={openNextPreview(i)}
          />
        ))}
      </div>
    </section>
  )
}