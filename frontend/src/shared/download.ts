import { apiUrl } from '$app/api'

export async function downloadFile(
  pageId: string,
  file: string,
  events: { onDownloaded?: (file: Blob) => any; onProgress?: (progress: number) => any },
  options?: { password?: string }
) {
  const downloadURL = new URL(`/page/${pageId}/${encodeURIComponent(file)}`, apiUrl)

  const xhr = new XMLHttpRequest()
  const fileRequest = await new Promise<{ success: boolean; status: number; response: Blob }>(
    (resolve) => {
      xhr.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          events?.onProgress?.(event.loaded / event.total)
        }
      })

      xhr.addEventListener('loadend', () => {
        resolve({
          success: xhr.readyState === 4,
          status: xhr.status,
          response: xhr.response as Blob
        })
      })
      xhr.open('GET', downloadURL, true)
      xhr.setRequestHeader('Authorization', options?.password ?? '')
      xhr.responseType = 'blob'
      xhr.send()
    }
  )

  if (fileRequest.status === 200) {
    const file = fileRequest.response
    const onDownloaded = events?.onDownloaded
    if (onDownloaded) {
      const result = await onDownloaded(file)
      return result
    } else {
      return file
    }
  } else {
    const filesResponseJSON = JSON.parse(await fileRequest.response.text())
    const fileResponse = filesResponseJSON as { ok: false; error: string }
    throw new Error(fileResponse.error)
  }
}
