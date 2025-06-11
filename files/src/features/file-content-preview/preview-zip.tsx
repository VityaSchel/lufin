import React from 'react'
import styles from './styles.module.scss'
import { Button } from '$shared/ui/components/button'
import {
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Button as MUIButton,
  DialogActions,
  Divider,
  useMediaQuery,
  AppBar,
  Toolbar,
  IconButton,
  Typography
} from '@mui/material'
import JSZip from 'jszip'
import TreeView from '@mui/lab/TreeView'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import TreeItem from '@mui/lab/TreeItem'
import { unflatten } from 'flat'
import { format } from 'date-fns'
import { FileContentPreview } from '$features/file-content-preview'
import mime from 'mime'
import { getSvgIconByFileType } from '$shared/utils/get-svg-icon-by-filetype'
import { getFileType } from '$shared/utils/get-file-type'
import cx from 'classnames'
import CloseIcon from '@mui/icons-material/Close'
import { m } from '$m'
import { getDateFnsLocale } from '$shared/utils/get-date-fns-locale'

type PreviewFileValue = null | JSObject
const ZipPreviewContext = React.createContext<
  [PreviewFileValue, React.Dispatch<React.SetStateAction<PreviewFileValue>>] | undefined
>(undefined)
export function PreviewZip({ zip }: { zip: File }) {
  const [zipContents, setZipContents] = React.useState<null | JSZip>(null)
  const [alertOpened, setAlertOpened] = React.useState(false)
  const [errored, setErrored] = React.useState<false | string>(false)
  const [previewFile, setPreviewFile] = React.useState<PreviewFileValue>(null)
  const isMobile = useMediaQuery('(max-width: 768px)')

  const handleOpen = () => {
    setAlertOpened(true)
    if (!zipContents) handleLoadZip()
  }

  const handleLoadZip = async () => {
    try {
      const jszip = await JSZip.loadAsync(zip)
      setZipContents(jszip)
    } catch (e) {
      if (typeof e === 'object' && e !== null) {
        const errorString =
          'message' in e && typeof e.message === 'string' && e.message.length
            ? e.message
            : JSON.stringify(e)
        if (errorString === 'Encrypted zip are not supported') {
          setErrored(m['preview.encrypted_zip_unsupported_error']())
        } else {
          setErrored(`${m['preview.zip_load_error']()}: ${e}`)
        }
      } else {
        setErrored(m['preview.load_error']())
      }
    }
  }

  const handleClose = () => {
    setAlertOpened(false)
    setPreviewFile(null)
  }

  return (
    <>
      {errored ? (
        <span className={styles.error}>{errored}</span>
      ) : (
        <Button onClick={() => handleOpen()} type="button">
          {zipContents
            ? m['preview.view_zip_file_preview']()
            : m['preview.load_zip_file_preview']()}
        </Button>
      )}
      <Dialog
        open={!errored && alertOpened}
        onClose={handleClose}
        // sx={{ height: '600px' }}
        maxWidth={false}
        fullScreen={isMobile}
      >
        {isMobile ? (
          <AppBar sx={{ position: 'relative' }}>
            <Toolbar>
              <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
                <CloseIcon />
              </IconButton>
              <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                {m['preview.preview_zip_file_button']()}
              </Typography>
            </Toolbar>
          </AppBar>
        ) : (
          <DialogTitle id="zip-file-contents-title">
            {m['preview.preview_zip_file_button']()}
          </DialogTitle>
        )}
        <DialogContent sx={{ width: '900px', maxWidth: '100%', height: '600px' }}>
          <ZipPreviewContext.Provider value={[previewFile, setPreviewFile]}>
            {zipContents ? (
              <div className={styles.contents}>
                <ZipContentsTree file={zipContents} />
                <PreviewFile zip={zipContents} />
              </div>
            ) : (
              <CircularProgress />
            )}
          </ZipPreviewContext.Provider>
        </DialogContent>
        {!isMobile && (
          <DialogActions>
            <MUIButton onClick={handleClose} autoFocus>
              {m['close_button']()}
            </MUIButton>
          </DialogActions>
        )}
      </Dialog>
    </>
  )
}

type JSObject = (typeof JSZip)['files'][string]
interface NestedLevel {
  '0': JSObject
  [key: string]: NestedLevel | JSObject
}
function ZipContentsTree({ file }: { file: JSZip }) {
  const tree = React.useMemo(() => {
    return unflatten(file.files, { delimiter: '/' }) as NestedLevel
  }, [file])

  return (
    <div className={styles.tree}>
      <TreeView
        aria-label="zip-file-contents-title"
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        sx={{ height: '100%', flexGrow: 1, minWidth: 200, overflowY: 'auto' }}
      >
        <RecursiveTreeItem item={tree} />
      </TreeView>
    </div>
  )
}

function RecursiveTreeItem({ item }: { item: NestedLevel }) {
  const contextValue = React.useContext(ZipPreviewContext)
  if (!contextValue) return null
  const [, setPreviewFile] = contextValue

  return (
    <>
      {Object.entries(item)
        .filter(([key, _]) => key !== '0')
        .map(([key, value], i) => {
          const isValueJsObject = 'dir' in value && value.dir === false
          if (isValueJsObject) {
            const file = value as JSObject
            const guessedMimeType = mime.getType(file.name)
            const fileType = getFileType(guessedMimeType ?? '', file.name)
            return (
              <TreeItem
                icon={getSvgIconByFileType(fileType)}
                nodeId={key}
                label={key}
                onClick={() => setPreviewFile(file)}
                key={file.name}
              />
            )
          } else {
            const _value = value as NestedLevel
            return (
              <TreeItem
                nodeId={key}
                label={key}
                key={key}
                className={cx({ [styles.hidden]: key === '__MACOSX' })}
              >
                <RecursiveTreeItem item={_value} />
              </TreeItem>
            )
          }
        })}
    </>
  )
}

function PreviewFile({ zip }: { zip: JSZip }) {
  const { i18n } = useTranslation('filesharing')
  const contextValue = React.useContext(ZipPreviewContext)
  const [fileContents, setFileContents] = React.useState<null | File>(null)
  const [guessedMimeType, setGuessedMimeType] = React.useState<null | string>(null)
  const isMobile = useMediaQuery('(max-width: 768px)')

  React.useEffect(() => {
    loadFileContents()
  }, [contextValue])

  if (!contextValue) return null

  const [previewFile] = contextValue

  const loadFileContents = async () => {
    const [previewFile] = contextValue
    if (!previewFile) return
    const previewFileInstance = zip.file(previewFile.name)
    if (!previewFileInstance) return
    const data = await previewFileInstance.async('blob')
    const guessedMimeType = mime.getType(previewFile.name)
    setGuessedMimeType(guessedMimeType)
    setFileContents(
      new File([data], previewFile.name, guessedMimeType ? { type: guessedMimeType } : undefined)
    )
  }

  return (
    previewFile && (
      <>
        <Divider flexItem orientation={isMobile ? 'horizontal' : 'vertical'} />
        <div
          className={cx(styles.previewZipFile, {
            [styles.maximize]: guessedMimeType === 'application/pdf'
          })}
        >
          <div className={styles.heading}>
            <h3 title={previewFile.name}>{previewFile.name}</h3>
          </div>
          <span className={styles.date}>
            {format(previewFile.date, 'EEEEEE, dd.MM.yyyy HH:mm:ss zzzz', {
              locale: getDateFnsLocale(i18n.resolvedLanguage ?? 'en')
            })}
          </span>
          {fileContents && <FileContentPreview file={fileContents} />}
        </div>
      </>
    )
  )
}
