import { getFilesAPIUrl } from '$shared/utils/api-url'

export async function downloadFile(pageID: string, file: string, events: { onDownloaded?: (file: Blob) => any, onProgress?: (progress: number) => any }, options?: { password?: string }) {
  const downloadURL = `${getFilesAPIUrl()}/files/${pageID}/${encodeURIComponent(file)}`

  const xhr = new XMLHttpRequest()
  const fileRequest = await new Promise<{ success: boolean, status: number, response: any }>((resolve) => {
    xhr.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        events?.onProgress?.(event.loaded / event.total)
      }
    })

    xhr.addEventListener('loadend', (e) => {
      resolve({ 
        success: xhr.readyState === 4, 
        status: xhr.status,
        response: xhr.response
      })
    })
    xhr.open('GET', downloadURL, true)
    xhr.setRequestHeader('Authorization', options?.password ?? '')
    xhr.responseType = 'blob'
    xhr.send()
  })

  if(fileRequest.status === 200) {
    const file = fileRequest.response as Blob
    const onDownloaded = events?.onDownloaded
    if(onDownloaded) {
      const result = await onDownloaded(file)
      return result
    } else {
      return file
    }
  } else {
    const filesResponseJSON = JSON.parse(xhr.responseText)
    const fileResponse = filesResponseJSON as { ok: false, error: string }
    throw new Error(fileResponse.error)
  }
}