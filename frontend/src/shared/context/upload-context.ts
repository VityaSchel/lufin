import React from 'react'

export type UploadFilesContextType =
  | { uploadedFiles: boolean[]; uploadRequestProgress: number[] }
  | undefined

export const UploadFilesContext = React.createContext<UploadFilesContextType>(undefined)
