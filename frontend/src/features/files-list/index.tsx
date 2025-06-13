import React from 'react'
import styles from './styles.module.scss'
import cx from 'classnames'
import { DataTable } from '$shared/ui/data-table'
import { format } from 'date-fns'
import { Button } from '$shared/ui/components/button'
// import { Checkbox } from '$shared/ui/components/checkbox'
import DownloadIcon from './icons/download.svg'
import DeleteIcon from './icons/delete.svg'
import TrueIcon from './icons/true.svg'
import FalseIcon from './icons/false.svg'
import { loadFilesPages, markFilesPageDeleted, updateFilePage } from '$shared/storage'
import { Link } from 'react-router'
import { useMediaQuery } from '@mui/material'
import { m } from '$m'
import { getDateFnsLocale } from '$shared/utils/get-date-fns-locale'
import { getLocale } from '$paraglide/runtime'

type UploadEntry = {
  pageId: string
  filesNames: string
  downloadLink: string
  deleteToken: string
  viewCount: number
  deleteAfterFirstDownload: boolean
  uploadDate: Date
  expiresAt: Date
  deleteLink: string
  deleted: boolean
  authorToken: string
}

export function FilesList() {
  const [entries, setEntries] = React.useState<null | UploadEntry[]>(null)
  const [entriesDisplayed, setEntriesDisplayed] = React.useState<UploadEntry[]>([])
  const isMobile = !useMediaQuery('(min-width: 768px)')

  React.useEffect(() => {
    window.addEventListener('storage', loadEntries)
    loadEntries()
    return () => window.removeEventListener('storage', loadEntries)
  }, [])

  const loadEntries = () => {
    let entries = loadFilesPages()
      .map((page) => ({
        pageId: page.pageId,
        filesNames: page.files.map((f) => f.name).join(', '),
        downloadLink: `${window.location.origin}/${page.pageId}#${page.decryptionToken}`,
        viewCount: page.viewCount,
        deleteAfterFirstDownload: page.deleteAfterFirstDownload,
        uploadDate: new Date(page.createdAt),
        expiresAt: new Date(page.expiresAt),
        deleteLink: `${window.location.origin}/delete/${page.deleteToken}`,
        deleteToken: page.deleteToken,
        deleted: page.deleted,
        authorToken: page.authorToken
      }))
      .sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime())
    setEntries(entries)
    setEntriesDisplayed(entries.slice(0, 15))
  }

  const nextEntriesPageSize =
    entries === null ? 0 : Math.min(15, entries.length - entriesDisplayed.length)

  return (
    <>
      {isMobile ? (
        <MobileDataList
          rows={entries === null ? [] : entriesDisplayed}
          renderRow={(row) => <MobileTableRow row={row} key={row.pageId} />}
          showBottomSeparator={nextEntriesPageSize > 0}
        />
      ) : (
        <DataTable
          columns={[
            { label: '' },
            { label: m.filesList_columns_name() },
            { label: m.filesList_columns_downloadLink() },
            { label: m.filesList_columns_downloads() },
            { label: m.uploadForm_deleteAfterFirstDownloadCheckbox() },
            { label: m.filesList_columns_uploadedAt() },
            { label: m.filesList_columns_expiresAt() },
            { label: m.filesList_columns_deleteLink() }
          ]}
          isLoading={entries === null}
          rows={entries === null ? [] : entriesDisplayed}
          renderRow={(row) => <StandaloneTableRow row={row} key={row.pageId} />}
        />
      )}
      {nextEntriesPageSize > 0 && (
        <div className="w-full flex justify-center">
          <Button
            variant="badge"
            onClick={() => {
              setEntriesDisplayed((prev) => [
                ...prev,
                ...(entries ? entries.slice(prev.length, prev.length + nextEntriesPageSize) : [])
              ])
            }}
          >
            Load {nextEntriesPageSize} more
          </Button>
        </div>
      )}
    </>
  )
}

const fetchInfo = async (
  row: UploadEntry,
  {
    setDownloadsCount,
    setIsDeleted,
    setExpiresAt
  }: {
    setDownloadsCount: (dc: number) => any
    setIsDeleted: (isd: boolean) => any
    setExpiresAt: (ea: number) => any
  }
) => {
  const infoRequest = await fetch(`${import.meta.env.VITE_API_URL}/page/${row.pageId}/info`, {
    headers: {
      Authorization: row.authorToken
    }
  })
  const infoResponse = (await infoRequest.json()) as
    | { ok: false; error: string }
    | { ok: true; downloads: number; expiresAt: number }
  if (infoResponse.ok) {
    setDownloadsCount(infoResponse.downloads)
    setExpiresAt(infoResponse.expiresAt)
  } else {
    setIsDeleted(true)
    markFilesPageDeleted(row.deleteToken)
  }
}

function StandaloneTableRow({ row }: { row: UploadEntry }) {
  const isExpired = row.expiresAt.getTime() < Date.now()
  // const [isChecked, setIsChecked] = React.useState(false)
  const [isDeleted, setIsDeleted] = React.useState(false)
  const [downloadsCount, setDownloadsCount] = React.useState<null | number>(null)
  const [expiresAt, setExpiresAt] = React.useState(row.expiresAt)
  const markedAsDeleted = row.deleted
  const disabled = isExpired || markedAsDeleted || isDeleted
  const cachedResponsePageId = React.useRef<string | null>(null)

  React.useEffect(() => {
    if (!row.deleted && row.authorToken) {
      if (cachedResponsePageId.current !== row.pageId) {
        cachedResponsePageId.current = row.pageId
        fetchInfo(row, {
          setDownloadsCount: (dc: number) => {
            setDownloadsCount(dc)
            updateFilePage(row.pageId, { viewCount: dc })
          },
          setIsDeleted,
          setExpiresAt: (at: number) => {
            setExpiresAt(new Date(at))
            updateFilePage(row.pageId, { expiresAt: at })
          }
        })
      }
    }
  }, [row.pageId])

  const encrypted = /#.+$/.test(row.downloadLink)

  return (
    <tr className={cx(styles.row, { [styles.unavailable]: disabled })}>
      <td>
        {encrypted ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24">
            <path
              fill="lightgreen"
              d="M6 22q-.825 0-1.412-.587T4 20V10q0-.825.588-1.412T6 8h1V6q0-2.075 1.463-3.537T12 1t3.538 1.463T17 6v2h1q.825 0 1.413.588T20 10v10q0 .825-.587 1.413T18 22zm6-5q.825 0 1.413-.587T14 15t-.587-1.412T12 13t-1.412.588T10 15t.588 1.413T12 17M9 8h6V6q0-1.25-.875-2.125T12 3t-2.125.875T9 6z"
            ></path>
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24px"
            height="24px"
            viewBox="0 0 24 24"
            className="ml-6"
          >
            <path
              fill="currentColor"
              d="M12 17q.825 0 1.413-.587T14 15t-.587-1.412T12 13t-1.412.588T10 15t.588 1.413T12 17m-6 5q-.825 0-1.412-.587T4 20V10q0-.825.588-1.412T6 8h7V6q0-2.075 1.463-3.537T18 1q1.875 0 3.263 1.213T22.925 5.2q.05.325-.225.563T22 6t-.7-.175t-.4-.575q-.275-.95-1.062-1.6T18 3q-1.25 0-2.125.875T15 6v2h3q.825 0 1.413.588T20 10v10q0 .825-.587 1.413T18 22z"
            ></path>
          </svg>
        )}
      </td>
      <td className="break-all lg:break-words">{row.filesNames}</td>
      <td>
        <div className={styles.flexCenter}>
          <DownloadButton disabled={disabled} link={row.downloadLink} />
        </div>
      </td>
      <td>{downloadsCount}</td>
      <td>
        <span className="m-auto inline-block">
          {row.deleteAfterFirstDownload ? <TrueIcon /> : <FalseIcon />}
        </span>
      </td>
      <td>{formatDate(row.uploadDate, getLocale())}</td>
      <td>{formatDate(expiresAt, getLocale())}</td>
      <td>
        <div className={styles.flexCenter}>
          <DeleteButton disabled={disabled} link={row.deleteLink} />
        </div>
      </td>
    </tr>
  )
}

function MobileDataList({
  rows,
  renderRow,
  showBottomSeparator
}: {
  rows: UploadEntry[]
  renderRow: (row: UploadEntry) => React.ReactNode
  showBottomSeparator: boolean
}) {
  return (
    <div className={cx(styles.list, { [styles.showBottomSeparator]: showBottomSeparator })}>
      {rows.map((row) => renderRow(row))}
    </div>
  )
}

function MobileTableRow({ row }: { row: UploadEntry }) {
  const isExpired = row.expiresAt.getTime() < Date.now()
  // const [isChecked, setIsChecked] = React.useState(false)
  const [isDeleted, setIsDeleted] = React.useState(false)
  const [downloadsCount, setDownloadsCount] = React.useState<null | number>(null)
  const [expiresAt, setExpiresAt] = React.useState(row.expiresAt)
  const markedAsDeleted = row.deleted
  const disabled = isExpired || markedAsDeleted || isDeleted
  const cachedResponsePageId = React.useRef<string | null>(null)

  React.useEffect(() => {
    if (!row.deleted && row.authorToken) {
      if (cachedResponsePageId.current !== row.pageId) {
        cachedResponsePageId.current = row.pageId
        fetchInfo(row, {
          setDownloadsCount: (dc: number) => {
            setDownloadsCount(dc)
            updateFilePage(row.pageId, { viewCount: dc })
          },
          setIsDeleted,
          setExpiresAt: (at: number) => {
            setExpiresAt(new Date(at))
            updateFilePage(row.pageId, { expiresAt: at })
          }
        })
      }
    }
  }, [row.pageId])

  return (
    <div className={cx(styles.mobileRow, { [styles.unavailable]: disabled })}>
      {/*<td><Checkbox name={'row'+row.pageId} value={false} onChange={() => {}} /*onChange={e => setIsChecked(e)} /></td>*/}
      <div className={styles.filename}>{row.filesNames}</div>
      <div>
        <span>{m.filesList_downloadLinkLabel()}</span>
        <DownloadButton disabled={disabled} link={row.downloadLink} />
      </div>
      {!disabled && (
        <div>
          <span>{m.filesList_downloads()}</span>
          {downloadsCount}
        </div>
      )}
      <div>
        <span>{m.uploadForm_deleteAfterFirstDownloadCheckbox()}</span>
        {row.deleteAfterFirstDownload ? <TrueIcon /> : <FalseIcon />}
      </div>
      <div>
        <span>{m.filesList_columns_uploadedAt()}</span>
        {formatDate(row.uploadDate, getLocale())}
      </div>
      <div>
        <span>{m.filesList_columns_expiresAt()}</span>
        {formatDate(expiresAt, getLocale())}
      </div>
      <div>
        <span>{m.filesList_deleteButton()}</span>
        <DeleteButton disabled={disabled} link={row.deleteLink} />
      </div>
    </div>
  )
}

function DownloadButton({ disabled, link }: { disabled: boolean; link: string }) {
  const url = new URL(link)

  return (
    <Link
      to={url.protocol + '//' + url.host + url.pathname + url.hash}
      tabIndex={disabled ? -1 : undefined}
      className={cx(styles.aLink, { [styles.disabled]: disabled })}
      rel="nofollow noreferrer"
      target="_blank"
    >
      <Button variant="dimmed" accent="green" iconButton disabled={disabled} tabIndex={-1}>
        <DownloadIcon />
      </Button>
    </Link>
  )
}

function DeleteButton({ disabled, link }: { disabled: boolean; link: string }) {
  return (
    <Link
      to={link}
      tabIndex={disabled ? -1 : undefined}
      className={cx(styles.aLink, { [styles.disabled]: disabled })}
      rel="nofollow noreferrer"
      target="_blank"
    >
      <Button variant="dimmed" accent="red" iconButton disabled={disabled} tabIndex={-1}>
        <DeleteIcon />
      </Button>
    </Link>
  )
}

const formatDate = (date: Date, locale: string) => {
  const dateFnsLocale = getDateFnsLocale(locale)
  return (
    format(date, 'dd MMMM yyyy', { locale: dateFnsLocale }) +
    '\n' +
    format(date, 'HH:mm', {
      locale: dateFnsLocale
    })
  )
}
