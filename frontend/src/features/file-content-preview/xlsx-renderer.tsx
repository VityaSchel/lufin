import React from 'react'
import { read, utils, type WorkBook } from 'xlsx'
import { Box, CircularProgress, Tab, Tabs } from '@mui/material'
import BiLinkExternal from '$assets/icons/link-external.svg?react'
import styles from './styles.module.scss'
import { m } from '$m'
import { Button } from '$shared/ui/components/button'

export default function PreviewSpreadsheetContent({ spreadsheet }: { spreadsheet: File }) {
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<null | string>(null)
  const [workbook, setWorkbook] = React.useState<WorkBook | null>(null)
  const [page, setPage] = React.useState(0)

  const handleLoadSpreadsheet = async (spreadsheet: File) => {
    const spreadsheetArrayBuf = await spreadsheet.arrayBuffer()
    const parsedSpreadsheet = await read(spreadsheetArrayBuf)
    setWorkbook(parsedSpreadsheet)
  }

  React.useEffect(() => {
    setLoading(true)
    handleLoadSpreadsheet(spreadsheet)
      .catch((e) => setError(`${m.preview_spreadsheetLoadingError()}: ${e.message}`))
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

function WorkSheet({ sheet }: { sheet: import('xlsx').WorkSheet }) {
  const blobWithTable = React.useMemo(() => {
    const htmlMarkup = utils.sheet_to_html(sheet)
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
