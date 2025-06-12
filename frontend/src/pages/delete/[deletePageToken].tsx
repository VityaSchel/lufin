import React from 'react'
import { FilesDeleted } from '$widgets/files-deleted'
import { deleteFilesPage } from '$app/api'
import { FilesDeletionConfirmation } from '$widgets/files-deleted/confirmation'
import { useParams } from 'react-router'
import { CircularProgress } from '@mui/material'

export default function DeleteFilesPage() {
  let [state, setState] = React.useState<'confirm' | 'loading' | 'success' | 'failed'>('confirm')
  const deletePageToken = useParams().deletePageToken as string
  if (state === 'confirm') {
    return (
      <FilesDeletionConfirmation
        onConfirm={() => {
          deleteFilesPage(deletePageToken)
            .then((response) => {
              if (response.ok) {
                setState('success')
              } else {
                setState('failed')
              }
            })
            .catch((error) => {
              console.error(error)
              setState('failed')
            })
          setState('loading')
        }}
      />
    )
  } else if (state === 'loading') {
    return (
      <div className="flex items-center justify-center flex-1">
        <CircularProgress />
      </div>
    )
  } else {
    return <FilesDeleted success={state === 'success'} />
  }
}
