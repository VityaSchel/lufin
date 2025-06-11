import React from 'react'
import { FilesDeleted } from '$widgets/files-deleted'
import { deleteFilesPage } from '$app/api'
import { FilesDeletionConfirmation } from '$widgets/files-deleted/confirmation'

export default function DeleteFilesPage() {
  let [state, setState] = React.useState<'confirm' | 'loading' | 'success' | 'failed'>('confirm')
  if (state === 'confirm') {
    return <FilesDeletionConfirmation onConfirm={() => setState('loading')} />
  } else if (state === 'loading') {
    return <></>
  } else {
    return <FilesDeleted success={state === 'success'} />
  }
}

// export const getServerSideProps: GetServerSideProps<DeleteFilesPageProps, { deletePageToken: string }> = async (context) => {
//   const deletePageToken = context.params?.deletePageToken
//   if (!deletePageToken) {
//     return {
//       notFound: true
//     }
//   }

//   const deleteConfirm = context.query.confirm === '1'

//   const apiURL = import.meta.env.VITE_FILES_API
//   if (!apiURL) throw new Error('VITE_FILES_API is not defined')
//   let success: boolean | null = null
//   if (deleteConfirm) {
//     const response = await deleteFilesPage(apiURL, deletePageToken)
//     success = response.ok
//   }

//   return {
//     props: {
//       ...(await serverSideTranslations(context.locale ?? context.defaultLocale ?? 'en', [
//         'filesharing',
//       ])),
//       success: success
//     }
//   }
// }
