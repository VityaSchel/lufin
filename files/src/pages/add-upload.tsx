'use client'

import React from 'react'
import { saveFilesPage } from '@/shared/storage'
import { z } from 'zod'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetServerSideProps } from 'next'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'

export default function AddUpload() {
  const { t } = useTranslation('filesharing')
  const [invalidParams, setInvalidParams] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const page = z.object({
      id: z.string().min(1),
      exp: z.coerce.number().int().positive(),
      fdd: z.string().transform(v => v === 'true').optional(),
      del: z.string().length(32),
      at: z.string().length(32),
      fn: z.string().min(1),
      ft: z.string().min(1),
    }).safeParse(Object.fromEntries(params.entries()))

    let hash = window.location.hash
    if (hash.startsWith('#')) {
      hash = hash.slice(1)
    }

    const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}={2})$/
    const decryptionKey = z.string().refine(value => base64Regex.test(value)).safeParse(hash)

    if(page.success === false || decryptionKey.success === false) {
      if(page.success === false) {
        console.error(page.error)
      } else if(decryptionKey.success === false) {
        console.error(decryptionKey.error)
      }
      setInvalidParams(true)
      return
    }

    saveFilesPage({
      pageID: page.data.id,
      decryptionToken: decryptionKey.data,
      files: [{ name: page.data.fn, type: page.data.ft }],
      expiresAt: new Date(page.data.exp),
      deleteAfterFirstDownload: page.data.fdd ?? false,
      deleteToken: page.data.del,
      authorToken: page.data.at
    })

    router.push(`/files/${page.data.id}#${decryptionKey.data}`)
  }, [])

  return (
    <div className='flex items-center justify-center h-[60vh] text-4xl text-red-600'>
      {invalidParams && <span>{t('error')}</span>}
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? context.defaultLocale ?? 'en', [
        'filesharing',
      ])),
    }
  }
}