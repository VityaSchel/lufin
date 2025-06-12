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
import FilesPage from '$pages/index'
import DeleteFilesPage from '$pages/delete/[deletePageToken]'
import FilePage from '$pages/[pageId]'
import DirectLinkFilePage from '$pages/[pageId]/[file]'
import PageNotFound from '$pages/404'
import { UploadsPage } from '$pages/uploads'

function App() {
  return (
    <BrowserRouter>
      <HelmetProvider>
        <ThemeProvider theme={theme}>
          <Toaster richColors />
          <PageContainer>
            <Routes>
              <Route path="/" element={<FilesPage />} />
              <Route path="/uploads" element={<UploadsPage />} />
              <Route path="/delete/:deletePageToken" element={<DeleteFilesPage />} />
              <Route path="/:pageId/:file" element={<DirectLinkFilePage />} />
              <Route path="/:pageId" element={<FilePage />} />
              <Route path="/*" element={<PageNotFound />} />
            </Routes>
          </PageContainer>
          <div id="modal" />
        </ThemeProvider>
      </HelmetProvider>
    </BrowserRouter>
  )
}

const root = document.getElementById('root')
ReactDOM.createRoot(root!).render(<App />)
