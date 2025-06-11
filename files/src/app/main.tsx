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
import HomePage from '$pages/index'
import FilesPage from '$pages/files'
import DeleteFilesPage from '$pages/files/delete/[deletePageToken]'
import FilePage from '$pages/files/[pageID]'
import DirectLinkFilePage from '$pages/files/[pageID]/[file]'
import PageNotFound from '$pages/404'

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ruRU}>
          <Toaster richColors />
          <PageContainer>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/files/:pageID/:file" element={<DirectLinkFilePage />} />
                <Route path="/files/:pageID" element={<FilePage />} />
                <Route path="/files/delete/:deletePageToken" element={<DeleteFilesPage />} />
                <Route path="/files" element={<FilesPage />} />
                <Route path="/*" element={<PageNotFound />} />
              </Routes>
            </BrowserRouter>
          </PageContainer>
          <div id="modal" />
        </LocalizationProvider>
      </ThemeProvider>
      <noscript>
        This app requires JavaScript for client-side encryption and decryption of files. Please
        enable JavaScript in your browser settings.
      </noscript>
    </HelmetProvider>
  )
}

const root = document.getElementById('root')
ReactDOM.createRoot(root!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
