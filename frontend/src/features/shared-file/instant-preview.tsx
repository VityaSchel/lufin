import React from 'react'
import type { DownloadableFile } from '$shared/model/download-file'
import { getFileType } from '$shared/utils/get-file-type'

export const supportedInstantPreviews = ['image']
export function InstantPreview({ file, content }: { file: DownloadableFile; content?: File }) {
  const fileType = React.useMemo(() => getFileType(file.mimeType, file.name), [file])
  const [blobURL, setBlobURL] = React.useState<null | string>('')

  React.useEffect(() => {
    if (fileType === 'image' && content) {
      const url = URL.createObjectURL(content)
      setBlobURL(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setBlobURL(null)
    }
  }, [fileType, content])

  if (blobURL) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={blobURL} alt="" />
    )
  } else {
    return null
  }
}
