import React from 'react'
import { GetServerSideProps } from 'next'
import { FilesDeleted } from '$widgets/files-deleted'
import { deleteFilesPage } from '$app/lib/server-utils'
import { useRouter } from 'next/router'
import { FilesDeletionConfirmation } from '$widgets/files-deleted/confirmation'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

type DeleteFilesPageProps = { success: boolean | null }

export default function DeleteFilesPage({ success }: DeleteFilesPageProps) {
  const router = useRouter()
  if(router.query.confirm === '1') {
    return (
      <FilesDeleted success={success as boolean} />
    )
  } else {
    return (
      <FilesDeletionConfirmation />
    )
  }
}

export const getServerSideProps: GetServerSideProps<DeleteFilesPageProps, { deletePageToken: string }> = async (context) => {
  const deletePageToken = context.params?.deletePageToken
  if (!deletePageToken) {
    return {
      notFound: true
    }
  }

  const deleteConfirm = context.query.confirm === '1'

  const apiURL = process.env.FILES_API_URI
  if (!apiURL) throw new Error('FILES_API_URI is not defined')
  let success: boolean | null = null
  if (deleteConfirm) {
    const response = await deleteFilesPage(apiURL, deletePageToken)
    success = response.ok
  }

  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? context.defaultLocale ?? 'en', [
        'filesharing',
      ])),
      success: success
    }
  }
}