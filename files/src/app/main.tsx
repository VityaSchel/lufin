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
import theme from '$app/mui/theme'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import ruRU from 'date-fns/locale/ru'
import FilesPage from '$pages/index'
import DeleteFilesPage from '$pages/delete/[deletePageToken]'
import FilePage from '$pages/[pageID]'
import DirectLinkFilePage from '$pages/[pageID]/[file]'
import PageNotFound from '$pages/404'

function App() {
  return (
    <BrowserRouter>
      <HelmetProvider>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ruRU}>
            <Toaster richColors />
            <PageContainer>
              <Routes>
                <Route path="/" element={<FilesPage />} />
                <Route path="/delete/:deletePageToken" element={<DeleteFilesPage />} />
                <Route path="/:pageID/:file" element={<DirectLinkFilePage />} />
                <Route path="/:pageID" element={<FilePage />} />
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
