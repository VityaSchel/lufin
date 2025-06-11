import React from 'react'
import styles from './styles.module.scss'
import * as XLSX from 'xlsx'
import { Box, CircularProgress, Tab, Tabs } from '@mui/material'
import { Button } from '$shared/ui/components/button'
import { BiLinkExternal } from 'react-icons/bi'
import { PiWarningLight } from 'react-icons/pi'
import { m } from '$m'

function PreviewSpreadsheetSafeGuard({ spreadsheet }: { spreadsheet: File }) {
  const [confirmed, setConfirmed] = React.useState(false)

  return spreadsheet.size > 1000000 && !confirmed ? (
    <div className={styles.spreadsheetIsTooBigWarning}>
      <PiWarningLight className={styles.icon} />
      <span>{m['preview.spreadsheet_big_warning']()}</span>
      <Button onClick={() => setConfirmed(true)}>
        {m['preview.spreadsheet_big_confirm_button']()}
      </Button>
    </div>
  ) : (
    <PreviewSpreadsheetContent spreadsheet={spreadsheet} />
  )
}

export { PreviewSpreadsheetSafeGuard as PreviewSpreadsheet }

export function PreviewSpreadsheetContent({ spreadsheet }: { spreadsheet: File }) {
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<null | string>(null)
  const [workbook, setWorkbook] = React.useState<XLSX.WorkBook | null>(null)
  const [page, setPage] = React.useState(0)

  const handleLoadSpreadsheet = async (spreadsheet: File) => {
    const spreadsheetArrayBuf = await spreadsheet.arrayBuffer()
    const parsedSpreadsheet = await XLSX.read(spreadsheetArrayBuf)
    setWorkbook(parsedSpreadsheet)
  }

  React.useEffect(() => {
    setLoading(true)
    handleLoadSpreadsheet(spreadsheet)
      .catch((e) => setError(`${m['preview.spreadsheet_loading_error']()}: ${e.message}`))
      .finally(() => setLoading(false))
  }, [spreadsheet])

  const handleChangePage = (_: any, newPage: number) => {
    setPage(newPage)
  }

  return loading ? (
    <span className={styles.loadingSpreadsheet}>
      <CircularProgress />
    </span>
  ) : error !== null || !workbook ? (
    <span className={styles.error}>{error}</span>
  ) : (
    <div className={styles.spreadsheetContainer}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }} className={styles.sheets}>
        <Tabs value={page} onChange={handleChangePage} variant="scrollable">
          {workbook.SheetNames.map((sheetName, i) => (
            <Tab label={sheetName} value={i} key={i} sx={{ textTransform: 'initial' }} />
          ))}
        </Tabs>
      </Box>
      <WorkSheet sheet={workbook.Sheets[workbook.SheetNames[page]]} />
    </div>
  )
}

function WorkSheet({ sheet }: { sheet: XLSX.WorkSheet }) {
  const blobWithTable = React.useMemo(() => {
    const htmlMarkup = XLSX.utils.sheet_to_html(sheet)
    const blob = new Blob(
      [
        `
    <head>
      <style>
        table {
          border-spacing: 0;
          border: 1px solid black;
          border-left: none;
          border-top: none;
          width: max-content;
        }

        table td[data-v],
        table td[data-v] ~ td {
          border: 1px solid black;
          border-right: none;
          border-bottom: none;
          padding: 4px;
        }

        table td {
          padding: 0;
        }

    
      </style>
    </head>
    <body>
      ${htmlMarkup}
    </body>
    `
      ],
      { type: 'text/html' }
    )
    return URL.createObjectURL(blob)
  }, [sheet])

  return (
    <>
      <Button
        variant={'dimmed'}
        iconButton
        onClick={() => window.open(blobWithTable, '_blank', 'noopener,noreferrer')}
        type="button"
        className={styles.openInNewTabButton}
      >
        <BiLinkExternal />
      </Button>
      <iframe className={styles.tableFrame} src={blobWithTable} sandbox=""></iframe>
    </>
  )
}
