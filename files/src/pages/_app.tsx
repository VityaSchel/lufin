import React from 'react'
import '@/shared/styles/tailwind.css'
import '@/shared/styles/globals.scss'
import type { AppProps } from 'next/app'
import { Toaster } from 'sonner'
import { PageContainer } from '@/widgets/common/page'
import { NoSsr, ThemeProvider } from '@mui/material'
import theme from '@/_app/mui/theme'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import ruRU from 'date-fns/locale/ru'
import { appWithTranslation, UserConfig } from 'next-i18next'
import nextI18NextConfig from '../../next-i18next.config.js'

const emptyInitialI18NextConfig: UserConfig = {
  defaultNS: 'filesharing',
  i18n: {
    defaultLocale: nextI18NextConfig.i18n.defaultLocale,
    locales: nextI18NextConfig.i18n.locales,
  },
}

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <NoSsr>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ruRU}>
            <Toaster richColors />
            <PageContainer>
              <Component {...pageProps} />
            </PageContainer>
            <div id='modal' />
          </LocalizationProvider>
        </ThemeProvider>
      </NoSsr>
      <noscript>
        This app requires JavaScript for client-side encryption and decryption of files. Please enable JavaScript in your browser settings.
      </noscript>
    </>
  )
}

export default appWithTranslation(App, emptyInitialI18NextConfig)
