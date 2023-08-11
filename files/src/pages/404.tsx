import React from "react"
import { useTranslation } from 'next-i18next'
import { GetStaticProps } from "next"
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export default function PageNotFound() {
  const { t } = useTranslation('filesharing')

  return (
    <div className='flex items-center justify-center h-[calc(100vh-230px)]'>
      <h1>{t('page_not_found')}</h1>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async (context) => {
  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? context.defaultLocale ?? 'en', [
        'filesharing',
      ])),
    }
  }
}