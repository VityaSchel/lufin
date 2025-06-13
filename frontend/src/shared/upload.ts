import type { FilesUploaderFormValues } from '$shared/model/files-uploader-values'
import { saveFilesPage as saveFilesPageToLocalStorage } from '$shared/storage'
import { encryptFiles } from '$shared/utils/files-encryption'
import { nmZipFilename } from '$shared/utils/zip-file-name'
import { apiUrl } from '$app/api'

type ValidatedValues = FilesUploaderFormValues & { files: File[]; checksum?: string }

export function onSubmitForm({
  values,
  uploadStrategy,
  callbacks
}: {
  values: FilesUploaderFormValues
  uploadStrategy: 'parallel' | 'sequential'
  callbacks: {
    onFileUploaded: (fileIndex: number) => any
    onLinksReady: (links: Links) => any
    setUploadRequestProgress: (fileIndex: number, progress: number) => any
    setUploadRequestProgressForAll: (progress: number, length?: number) => any
  }
}) {
  return new Promise<void>(async (resolve) => {
    const validatedValues = values as ValidatedValues

    let srcFiles = validatedValues.files.map(
      (f) => new File([f.blob], f.name || f.initialName, { type: f.type })
    )
    if (validatedValues.convertToZip) {
      try {
        const JSZip = await import('jszip').then((m) => m.default)
        const zip = new JSZip()
        validatedValues.files.forEach((file) => zip.file(file.name || file.initialName, file.blob))
        const blobZip = await zip.generateAsync({ type: 'blob' })
        srcFiles = [
          new File(
            [blobZip],
            nmZipFilename(validatedValues.zipArchiveName ?? '') || 'documents.zip'
          )
        ]
      } catch (e) {
        alert('Error while creating zip archive')
        throw e
      }
    }

    let files: File[] = []
    let privateDecryptionKey: string
    if (values.encrypt) {
      try {
        const { result, checksum } = await encryptFiles(srcFiles)
        files = result.files
        privateDecryptionKey = result.privateDecryptionKey
        validatedValues.checksum = checksum
      } catch (e) {
        alert('Error while encrypting files')
        throw e
      }
    } else {
      files = srcFiles
      privateDecryptionKey = ''
    }

    try {
      const bodies = generateUploadBody(files, validatedValues)

      const startUploadRequest = await fetch(new URL('/upload', apiUrl), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodies.startUploadBody)
      })
      if (startUploadRequest.status !== 200) {
        throw new Error('Error while starting files uploading')
      }
      const startUploadResponse = await startUploadRequest.json()
      const wsChannelId = startUploadResponse.websocketChannelId
      const tmpUploadId = startUploadResponse.tmpUploadId
      const links = startUploadResponse.links

      const onUploadSuccess = ({
        authorToken,
        expiresAt
      }: {
        authorToken: string
        expiresAt: number
      }) => {
        saveFilesPageToLocalStorage({
          pageId: links.download,
          decryptionToken: privateDecryptionKey,
          files: srcFiles.map((f) => ({ name: f.name, type: f.type })),
          expiresAt: new Date(expiresAt),
          deleteAfterFirstDownload: values.deleteAtFirstDownload,
          deleteToken: links.delete,
          authorToken
        })
        callbacks.onLinksReady({
          download: `${window.location.origin}/${links.download}${values.encrypt ? '#' + privateDecryptionKey : ''}`,
          delete: `${window.location.origin}/delete/${links.delete}`
        })
      }

      subscribeToWebSocket(wsChannelId, callbacks.onFileUploaded, onUploadSuccess, resolve)

      callbacks.setUploadRequestProgressForAll(0, values.files?.length)
      if (uploadStrategy === 'parallel') {
        await xmlRequest(
          new URL(`/upload/${tmpUploadId}`, apiUrl),
          { method: 'POST', body: bodies.uploadBody },
          (progress: number) => {
            callbacks.setUploadRequestProgressForAll(progress, values.files?.length)
          }
        )
      } else {
        for (let i = 0; i < files.length; i++) {
          const body = new FormData()
          const keys = [`file${i}`, `file${i}_type`]
          keys.forEach((key) => body.append(key, bodies.uploadBody.get(key)!))
          await xmlRequest(
            new URL(`/upload/${tmpUploadId}`, apiUrl),
            { method: 'POST', body },
            (progress: number) => {
              if (values.convertToZip) {
                callbacks.setUploadRequestProgressForAll(progress, values.files?.length)
              } else {
                callbacks.setUploadRequestProgress(i, progress)
              }
            }
          )
        }
      }

      const finishUploadRequest = await fetch(new URL(`/upload/${tmpUploadId}/finish`, apiUrl), {
        method: 'POST',
        body: ''
      })
      if (finishUploadRequest.status !== 200) {
        throw new Error(
          'Error while finishing files uploading ' + (await finishUploadRequest.text())
        )
      }
    } catch (e) {
      alert('Connection error')
      console.error(e)
      resolve()
    }
  })
}

function generateUploadBody(
  files: File[],
  values: ValidatedValues
): { startUploadBody: object; uploadBody: FormData } {
  const startUploadBody: Record<string, any> = {}
  const uploadBody = new FormData()

  if (values.password) {
    startUploadBody['password'] = values.password
  }
  startUploadBody['deleteAtFirstDownload'] = values.deleteAtFirstDownload ? 'true' : 'false'
  startUploadBody['encrypted'] = values.encrypt ? 'true' : 'false'
  if (values.checksum) {
    startUploadBody['checksum'] = values.checksum
  }

  files.forEach((file, i) => {
    uploadBody.append(`file${i}`, file)
    uploadBody.append(
      `file${i}_type`,
      values.convertToZip ? 'application/zip' : values.files[i].type
    )
  })

  return {
    startUploadBody,
    uploadBody
  }
}

function subscribeToWebSocket(
  channelId: string,
  onFileUploaded: (fileIndex: number) => any,
  onUploadSuccess: (data: { links: Links; authorToken: string; expiresAt: number }) => any,
  resolve: () => any
) {
  const url = new URL(`/updates/${channelId}`, apiUrl)
  let lastMessage = {}
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  const ws = new WebSocket(url)
  ws.onmessage = ({ origin, data }) => {
    if (origin !== url.origin) {
      console.warn('Received message from unknown origin:', origin)
      return
    }
    const payload = JSON.parse(data) as
      | { update_type: 'progress'; file: string; status: 'SAVED' }
      | { update_type: 'upload_errored'; error: 'string'; isClosing: true }
      | {
          update_type: 'upload_success'
          links: { download: string; delete: string }
          author_token: string
          expires_at: number
          isClosing: true
        }
      | { update_type: 'errored'; reason: string; isClosing: true }
    lastMessage = payload
    switch (payload.update_type) {
      case 'progress':
        onFileUploaded(Number(payload.file.substring('file'.length)))
        break
      case 'upload_errored':
        alert('Error while uploading files: ' + payload.error)
        resolve()
        break
      case 'upload_success':
        onUploadSuccess({
          links: payload.links,
          authorToken: payload.author_token,
          expiresAt: payload.expires_at
        })
        resolve()
        break
      case 'errored':
        console.error('Error while uploading files', payload.reason)
        alert('Error while uploading files!')
        resolve()
        break
    }
  }
  ws.addEventListener('error', (event) => {
    console.error('Error with websocket', event)
  })
  ws.addEventListener('close', () => {
    if (!('isClosing' in lastMessage) || lastMessage['isClosing'] !== true) {
      subscribeToWebSocket(channelId, onFileUploaded, onUploadSuccess, resolve)
    }
  })
}

function xmlRequest(
  url: URL,
  options: { method: string; body: FormData },
  onProgress: (progress: number) => any
) {
  const xhr = new XMLHttpRequest()
  return new Promise<{ success: boolean; status: number; response: string }>((resolve) => {
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        onProgress(event.loaded / event.total)
      }
    })
    // xhr.addEventListener('progress', (event) => {
    //   if (event.lengthComputable) {
    //     downloadProgress.value = event.loaded / event.total
    //   }
    // })
    xhr.addEventListener('loadend', () => {
      resolve({
        success: xhr.readyState === 4,
        status: xhr.status,
        response: xhr.responseText
      })
    })
    xhr.open(options.method, url, true)
    xhr.send(options.body)
  })
}

export type Links = { download: string; delete: string }
