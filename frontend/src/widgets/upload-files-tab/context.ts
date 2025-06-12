import React from 'react'

export const UploadFilesContext = React.createContext<
  { uploadedFiles: boolean[]; uploadRequestProgress: number[] } | undefined
>(undefined)
