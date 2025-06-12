import '$shared/styles/tailwind.css'
import '$shared/styles/globals.scss'
import '@fontsource-variable/golos-text'
import '@fontsource-variable/roboto'
import '@fontsource-variable/roboto-mono'
import '@fontsource-variable/noto-sans-mono'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter, Route, Routes } from 'react-router'
import { Toaster } from 'sonner'
import { PageContainer } from '$widgets/common/page'
import { ThemeProvider } from '@mui/material'
import theme from '$app/mui'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import FilesPage from '$pages/index'
import DeleteFilesPage from '$pages/delete/[deletePageToken]'
import FilePage from '$pages/[pageId]'
import DirectLinkFilePage from '$pages/[pageId]/[file]'
import PageNotFound from '$pages/404'
import { getDateFnsLocale } from '$shared/utils/get-date-fns-locale'
import { getLocale } from '$paraglide/runtime'

function App() {
  return (
    <BrowserRouter>
      <HelmetProvider>
        <ThemeProvider theme={theme}>
          <LocalizationProvider
            dateAdapter={AdapterDateFns}
            adapterLocale={getDateFnsLocale(getLocale())}
          >
            <Toaster richColors />
            <PageContainer>
              <Routes>
                <Route path="/" element={<FilesPage />} />
                <Route path="/delete/:deletePageToken" element={<DeleteFilesPage />} />
                <Route path="/:pageId/:file" element={<DirectLinkFilePage />} />
                <Route path="/:pageId" element={<FilePage />} />
                <Route path="/*" element={<PageNotFound />} />
              </Routes>
            </PageContainer>
            <div id="modal" />
          </LocalizationProvider>
        </ThemeProvider>
        <noscript>
          This app requires JavaScript for client-side encryption and decryption of files. Please
          enable JavaScript in your browser settings.
        </noscript>
      </HelmetProvider>
    </BrowserRouter>
  )
}

const root = document.getElementById('root')
ReactDOM.createRoot(root!).render(<App />)
