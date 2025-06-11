import type { FilesUploaderFormValues } from '$shared/model/files-uploader-values'
import { saveFilesPage as saveFilesPageToLocalStorage } from '$shared/storage'
import { encryptFiles } from '$shared/utils/files-encryption'
import { getExpiresAt } from '$shared/utils/get-max-expiration'
import { nmZipFilename } from '$shared/utils/zip-file-name'
import type { Links } from '$widgets/upload-files-tab'
import JSZip from 'jszip'

type ValidatedValues = FilesUploaderFormValues & { files: File[] }
export function onSubmitForm(
  values: FilesUploaderFormValues,
  uploadStrategy: 'parallel' | 'sequential',
  options: { host: string },
  callbacks: {
    onFileUploaded: (fileIndex: number) => any, 
    onLinksReady: (links: Links) => any, 
    setUploadRequestProgress: (fileIndex: number, progress: number) => any,
    setUploadRequestProgressForAll: (progress: number, length?: number) => any
  }
) {
  return new Promise<void>(async (resolve) => {
    const validatedValues = values as ValidatedValues

    let srcFiles = validatedValues.files
      .map(f => new File([f.blob], f.name || f.initialName, { type: f.type }))
    if(validatedValues.convertToZip) {
      try {
        const zip = new JSZip()
        validatedValues.files.forEach(file => zip.file(file.name || file.initialName, file.blob))
        const blobZip = await zip.generateAsync({ type: 'blob' })
        srcFiles = [new File([blobZip], nmZipFilename(validatedValues.zipArchiveName ?? '') || 'documents.zip')]
      } catch(e) {
        alert('Ошибка при архивировании файлов в zip!')
        throw e
      }
    }

    let files: File[] = [], privateDecryptionKey: string
    if(values.encrypt) {
      try {
        const result = await encryptFiles(srcFiles)
        files = result.files
        privateDecryptionKey = result.privateDecryptionKey
      } catch(e) {
        alert('Ошибка при шифровании файлов!')
        throw e
      }
    } else {
      files = srcFiles
      privateDecryptionKey = ''
    }

    try {
      const bodies = generateUploadBody(files, validatedValues)

      const startUploadRequest = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodies.startUploadBody),
      })
      if(startUploadRequest.status !== 200) {
        throw new Error('Error while starting files uploading')
      }
      const startUploadResponse = await startUploadRequest.json()
      const wsChannelID = startUploadResponse.websocketChannelID
      const tmpUploadID = startUploadResponse.tmpUploadID
      const links = startUploadResponse.links

      const onUploadSuccess = ({ authorToken }: { authorToken: string }) => {
        const filesSumSize = files.reduce((prev, cur) => prev + cur.size, 0)
        saveFilesPageToLocalStorage({
          pageID: links.download,
          decryptionToken: privateDecryptionKey,
          files: srcFiles.map(f => ({ name: f.name, type: f.type })),
          expiresAt: new Date(getExpiresAt(values.expiresAt, filesSumSize)),
          deleteAfterFirstDownload: values.deleteAtFirstDownload,
          deleteToken: links.delete,
          authorToken
        })
        callbacks.onLinksReady({
          download: `${window.location.protocol}//${options.host}/files/${links.download}${values.encrypt ? '#' + privateDecryptionKey : ''}`,
          delete: `${window.location.protocol}//${options.host}/files/delete/${links.delete}`
        })
      }

      subscribeToWebSocket(
        wsChannelID, 
        callbacks.onFileUploaded, 
        onUploadSuccess,
        resolve
      )

      callbacks.setUploadRequestProgressForAll(0, values.files?.length)
      let request: { success: boolean, status: number, response: string }
      if(uploadStrategy === 'parallel') {
        request = await xmlRequest(
          `${import.meta.env.VITE_API_URL}/upload/${tmpUploadID}`, 
          { method: 'POST', body: bodies.uploadBody },
          (progress: number) => {
            callbacks.setUploadRequestProgressForAll(progress, values.files?.length)
          }
        )
      } else {
        for(let i = 0; i < files.length; i++) {
          const body = new FormData()
          const keys = [`file${i}`, `file${i}_type`]
          keys.forEach(key => body.append(key, bodies.uploadBody.get(key)!))
          request = await xmlRequest(
            `${import.meta.env.VITE_API_URL}/upload/${tmpUploadID}`, 
            { method: 'POST', body },
            (progress: number) => {
              if(values.convertToZip) {
                callbacks.setUploadRequestProgressForAll(progress, values.files?.length)
              } else {
                callbacks.setUploadRequestProgress(i, progress)
              }
            }
          )
        }
      }

      const finishUploadRequest = await fetch(`${import.meta.env.VITE_API_URL}/upload/${tmpUploadID}/finish`, {
        method: 'POST', body: ''
      })
      if(finishUploadRequest.status !== 200) {
        throw new Error('Error while finishing files uploading ' + await finishUploadRequest.text())
      }
    } catch(e) {
      alert('Не удалось установить соединение с сервером')
      console.error(e)
      resolve()
    }
  })
}

function generateUploadBody(files: File[], values: ValidatedValues): { startUploadBody: object, uploadBody: FormData } {
  const startUploadBody: Record<string, any> = {}
  const uploadBody = new FormData()

  const filesSumSize = files.reduce((prev, cur) => prev + cur.size, 0)
  startUploadBody['expiresAt'] = String(getExpiresAt(values.expiresAt, filesSumSize))

  if (values.password) {
    startUploadBody['password'] = values.password
  }
  startUploadBody['deleteAtFirstDownload'] = values.deleteAtFirstDownload ? 'true' : 'false'
  startUploadBody['encrypted'] = values.encrypt ? 'true' : 'false'

  files.forEach((file, i) => {
    uploadBody.append(`file${i}`, file)
    uploadBody.append(`file${i}_type`, values.convertToZip ? 'application/zip' : values.files[i].type)
  })

  return {
    startUploadBody,
    uploadBody
  }
}

const getFilesWebsocketUrl = (apiUrl: string) => {
  const url = new URL(apiUrl)
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  return url.toString()
}

function subscribeToWebSocket(channelID: string, onFileUploaded: (fileIndex: number) => any, onUploadSuccess: (data: { links: Links, authorToken: string }) => any, resolve: () => any) {
  const socket = new WebSocket(`${getFilesWebsocketUrl(import.meta.env.VITE_API_URL)}/updates/${channelID}`)
  let lastMessage = {}
  socket.addEventListener('message', (event) => {
    const msg = event.data as string
    const data = JSON.parse(msg) as (
      { update_type: 'progress', file: string, status: 'SAVED' } | 
      { update_type: 'upload_errored', error: 'string', isClosing: true } | 
      { update_type: 'upload_success', links: { download: string, delete: string }, author_token: string, isClosing: true } | 
      { update_type: 'errored', reason: string, isClosing: true }
    )
    lastMessage = data
    switch(data.update_type) {
      case 'progress':
        onFileUploaded(Number(data.file.substring('file'.length)))
        break
      case 'upload_errored':
        alert('Ошибка во время загрузки файлов: ' + data.error)
        resolve()
        break
      case 'upload_success':
        onUploadSuccess({ links: data.links, authorToken: data.author_token })
        resolve()
        break
      case 'errored':
        console.error('Error while uploading files', data.reason)
        alert('Ошибка во время загрузки файлов!')
        resolve()
        break
    }
  })
  socket.addEventListener('error', (event) => {
    console.error('Error with websocket', event)
  })
  socket.addEventListener('close', () => {
    if(!('isClosing' in lastMessage) || lastMessage['isClosing'] !== true) {
      subscribeToWebSocket(
        channelID,
        onFileUploaded,
        onUploadSuccess,
        resolve
      )
    }
  })
}

function xmlRequest(url: string, options: { method: string, body: FormData }, onProgress: (progress: number) => any) {
  const xhr = new XMLHttpRequest()
  return new Promise<{ success: boolean, status: number, response: string }>((resolve) => {
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