import React, { useContext } from 'react'
import styles from './styles.module.scss'
import { Headline } from '$entities/headline'
import byteSize from 'byte-size'
import { Button } from '$shared/ui/components/button'
import saveAs from 'file-saver'
import { type DecryptionKey, decrypt } from 'lufin-lib'
import { downloadFile } from '$shared/download'
import { DecryptionKeyContext } from '$shared/context/decryption-key-context'
import type { SharedFileForDownload } from '$shared/model/shared-file'
import DownloadIcon from './icons/download.svg'
import { FileContentPreview } from '$features/file-content-preview'
import { Progress } from '$shared/ui/progress'
import { HorizontalCard } from '$shared/ui/components/horizontal-card'
import { getSvgIconByFileType } from '$shared/utils/get-svg-icon-by-filetype'
import { m } from '$m'
import { EmbedLinks } from '$features/embed-links'
import { getFileType } from '$shared/utils/get-file-type'
import { useParams } from 'react-router'

export function DirectLinkFileWidget({
  encrypted,
  password,
  file,
  onAbort
}: {
  encrypted: boolean
  password?: string
  file: SharedFileForDownload
  onAbort: () => any
}) {
  const decryptionKey = useContext(DecryptionKeyContext) as DecryptionKey
  const params = useParams()

  const [status, setStatus] = React.useState<'idle' | 'downloading' | 'error' | 'done'>('idle')

  const [fileContents, setFileContents] = React.useState<File | null>(null)
  const [downloadProgress, setDownloadProgress] = React.useState<null | number>(null)

  const isFirstRender = React.useRef(true)

  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      handleStartDownloading()
    }
  }, [])

  const pageId = params.pageId as string
  const fileNameOrIndex = params.file as string

  const handleStartDownloading = async () => {
    setStatus('downloading')
    const downloadStart = Date.now()

    try {
      return await downloadFile(
        pageId,
        fileNameOrIndex,
        {
          onDownloaded: (file) => handleDownloaded(file),
          onProgress: (progress) => setDownloadProgress(progress)
        },
        { password }
      )
    } catch (e) {
      console.error('Error while downloading file', e)
      setStatus('error')
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

  const handleDownloaded = async (content: Blob) => {
    try {
      let blob = content
      if (encrypted) {
        const buf = await decrypt(content, decryptionKey)
        blob = new Blob([buf])
      }
      const newDecryptedFile = new File([blob], file.name, { type: file.mimeType })
      setFileContents(newDecryptedFile)
      setStatus('done')
      return newDecryptedFile
    } catch (e) {
      setStatus('error')
      console.error('Error while decrypting file', e)
      onAbort()
      return false
    }
  }

  return (
    <section className={styles.fileInfo}>
      <Headline>{file.name}</Headline>
      <span className={styles.size}>{byteSize(file.sizeInBytes).toString()}</span>
      <Button
        onClick={fileContents ? () => saveAs(fileContents) : () => handleStartDownloading()}
        disabled={status === 'downloading'}
        className="mb-5"
      >
        {m.downloadFileButton()} <DownloadIcon />
      </Button>
      {fileContents ? (
        <FileContentPreview file={fileContents} />
      ) : (
        <div className={styles.outlinedFile}>
          <HorizontalCard
            icon={getSvgIconByFileType('file')}
            title={m.downloadingFile()}
            subtitle={m.downloadedFile() + ' ' + Math.round(downloadProgress! * 100) + '%'}
          />
          <Progress progress={downloadProgress! * 100} />
        </div>
      )}
      {!encrypted && !password && getFileType(file.mimeType, file.name) === 'image' && (
        <EmbedLinks pageId={pageId} file={fileNameOrIndex} />
      )}
    </section>
  )
}
