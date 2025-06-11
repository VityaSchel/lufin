import React from 'react'
import styles from './styles.module.scss'
import cx from 'classnames'
import { DataTable } from '$shared/ui/data-table'
import { format } from 'date-fns'
import { Button } from '$shared/ui/components/button'
import { Checkbox } from '$shared/ui/components/checkbox'
import DownloadIcon from './icons/download.svg'
import DeleteIcon from './icons/delete.svg'
import TrueIcon from './icons/true.svg'
import FalseIcon from './icons/false.svg'
import { loadFilesPages, markFilesPageDeleted, updateFilePage } from '$shared/storage'
import Link from 'next/link'
import { useMediaQuery } from '@mui/material'
import { getFilesAPIUrl } from '$shared/utils/api-url'
import { useTranslation } from 'next-i18next'
import { getDateFnsLocale } from '$shared/utils/get-date-fns-locale'

type SharedFile = {
  pageID: string
  filesNames: string
  downloadLink: string
  deleteToken: string
  // viewCount: number
  // deleteAfterFirstDownload: boolean
  uploadDate: Date
  expiresAt: Date
  deleteLink: string
  deleted: boolean
  authorToken: string
}

export function FilesList() {
  const { t } = useTranslation('filesharing')
  const [pages, setPages] = React.useState<null | SharedFile[]>(null)
  const isMobile = useMediaQuery('(max-width: 768px)')

  const host = window.location.host

  React.useEffect(() => { 
    const handler = () => { loadPages() }
    window.addEventListener('storage', handler)
    handler()
    return () => window.removeEventListener('storage', handler)
  }, [])

  const loadPages = () => {
    const pages = loadFilesPages()
    setPages(
      pages
        .map(page => ({
          pageID: page.pageID,
          filesNames: page.files.map(f => f.name).join(', '),
          downloadLink: `${host?.startsWith('localhost') ? 'http://' : 'https://'}${host}/files/${page.pageID}#${page.decryptionToken}`,
          uploadDate: new Date(page.createdAt),
          expiresAt: new Date(page.expiresAt),
          deleteLink: `${host?.startsWith('localhost') ? 'http://' : 'https://'}${host}/files/delete/${page.deleteToken}`,
          deleteToken: page.deleteToken,
          deleted: page.deleted,
          authorToken: page.authorToken
        }))
        .sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime())
    )
  }

  return (
    isMobile 
      ?  (
        <MobileDataList 
          rows={pages === null ? [] : pages}
          renderRow={row => <MobileTableRow row={row} key={row.pageID} />} 
        />
      ) : (
        <DataTable
          columns={[
            { label: '' },
            { label: t('files_list.columns.name') },
            { label: t('files_list.columns.download_link') },
            { label: t('files_list.columns.downloads') },
            // { label: 'Удалить при\nпервом скачивании?' },
            { label: t('files_list.columns.uploaded_at') },
            { label: t('files_list.columns.expires_at') },
            { label: t('files_list.columns.delete_link') },
          ]}
          isLoading={pages === null}
          rows={pages === null ? [] : pages}
          renderRow={row => <StandaloneTableRow row={row} key={row.pageID} />}
        />
      )
  )
}

const fetchInfo = async (row: SharedFile, { setDownloadsCount, setIsDeleted, setExpiresAt }: {
  setDownloadsCount: (dc: number) => any
  setIsDeleted: (isd: boolean) => any
  setExpiresAt: (ea: number) => any
}) => {
  const infoRequest = await fetch(`${getFilesAPIUrl()}/basic-info/${row.pageID}`, {
    headers: {
      'Authorization': row.authorToken
    }
  })
  const infoResponse = await infoRequest.json() as { ok: false, error: string } | { ok: true, exists: false } | { ok: true, exists: true, downloads: number, expiresAt: number }
  if (infoResponse.ok) {
    if (infoResponse.exists) {
      setDownloadsCount(infoResponse.downloads)
      setExpiresAt(infoResponse.expiresAt)
    } else {
      setIsDeleted(true)
      markFilesPageDeleted(row.deleteToken)
    }
  }
}

function StandaloneTableRow({ row }: {
  row: SharedFile
}) {
  const { i18n } = useTranslation('filesharing')
  const isExpired = row.expiresAt.getTime() < Date.now()
  // const [isChecked, setIsChecked] = React.useState(false)
  const [isDeleted, setIsDeleted] = React.useState(false)
  const [downloadsCount, setDownloadsCount] = React.useState<null | number>(null)
  const [expiresAt, setExpiresAt] = React.useState(row.expiresAt)
  const markedAsDeleted = row.deleted
  const disabled = isExpired || markedAsDeleted || isDeleted
  const cachedResponsePageID = React.useRef<string | null>(null)
  
  React.useEffect(() => {
    if (!row.deleted && row.authorToken) {
      if (cachedResponsePageID.current !== row.pageID) {
        cachedResponsePageID.current = row.pageID
        fetchInfo(row, { 
          setDownloadsCount, 
          setIsDeleted, 
          setExpiresAt: (at: number) => {
            setExpiresAt(new Date(at))
            updateFilePage(row.pageID, { expiresAt: at })
          }
        })
      }
    }
  }, [row.pageID])
  
  const encrypted = /#.+$/.test(row.downloadLink)

  return (
    <tr className={cx(styles.row, { [styles.unavailable]: disabled })}>
      <td>
        {encrypted ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" className='ml-6'><path fill="lightgreen" d="M6 22q-.825 0-1.412-.587T4 20V10q0-.825.588-1.412T6 8h1V6q0-2.075 1.463-3.537T12 1t3.538 1.463T17 6v2h1q.825 0 1.413.588T20 10v10q0 .825-.587 1.413T18 22zm6-5q.825 0 1.413-.587T14 15t-.587-1.412T12 13t-1.412.588T10 15t.588 1.413T12 17M9 8h6V6q0-1.25-.875-2.125T12 3t-2.125.875T9 6z"></path></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" className='ml-6'><path fill="currentColor" d="M12 17q.825 0 1.413-.587T14 15t-.587-1.412T12 13t-1.412.588T10 15t.588 1.413T12 17m-6 5q-.825 0-1.412-.587T4 20V10q0-.825.588-1.412T6 8h7V6q0-2.075 1.463-3.537T18 1q1.875 0 3.263 1.213T22.925 5.2q.05.325-.225.563T22 6t-.7-.175t-.4-.575q-.275-.95-1.062-1.6T18 3q-1.25 0-2.125.875T15 6v2h3q.825 0 1.413.588T20 10v10q0 .825-.587 1.413T18 22z"></path></svg>
        )}
      </td>
      <td>{row.filesNames}</td>
      <td>
        <div className={styles.flexCenter}>
          <DownloadButton
            disabled={disabled}
            link={row.downloadLink}
          />
        </div>
      </td>
      <td>{downloadsCount}</td>
      {/*<td>{row.deleteAfterFirstDownload ? <TrueIcon /> : <FalseIcon />}</td> */}
      <td>{formatDate(row.uploadDate, i18n.resolvedLanguage ?? 'en')}</td>
      <td>{formatDate(expiresAt, i18n.resolvedLanguage ?? 'en')}</td>
      <td>
        <div className={styles.flexCenter}>
          <DeleteButton disabled={disabled} link={row.deleteLink} />
        </div>
      </td>
    </tr>
  )
}

function MobileDataList({ rows, renderRow }: {
  rows: SharedFile[]
  renderRow: (row: SharedFile) => React.ReactNode
}) {
  return (
    <div className={styles.list}>
      {rows.map(row => renderRow(row))}
    </div>
  )
}

function MobileTableRow({ row }: { 
  row: SharedFile
}) {
  const { t, i18n } = useTranslation('filesharing')
  const isExpired = row.expiresAt.getTime() < Date.now()
  // const [isChecked, setIsChecked] = React.useState(false)
  const [isDeleted, setIsDeleted] = React.useState(false)
  const [downloadsCount, setDownloadsCount] = React.useState<null | number>(null)
  const [expiresAt, setExpiresAt] = React.useState(row.expiresAt)
  const markedAsDeleted = row.deleted
  const disabled = isExpired || markedAsDeleted || isDeleted
  const cachedResponsePageID = React.useRef<string | null>(null)

  React.useEffect(() => {
    if (!row.deleted && row.authorToken) {
      if (cachedResponsePageID.current !== row.pageID) {
        cachedResponsePageID.current = row.pageID
        fetchInfo(row, { 
          setDownloadsCount, 
          setIsDeleted,
          setExpiresAt: (at: number) => {
            setExpiresAt(new Date(at))
            updateFilePage(row.pageID, { expiresAt: at })
          }
        })
      }
    }
  }, [row.pageID])

  return (
    <div className={cx(styles.mobileRow, { [styles.unavailable]: disabled })}>
      {/*<td><Checkbox name={'row'+row.pageID} value={false} onChange={() => {}} /*onChange={e => setIsChecked(e)} /></td>*/}
      <div className={styles.filename}>{row.filesNames}</div>
      <div>
        <span>{t('files_list.download_link_label')}</span>
        <DownloadButton disabled={disabled} link={row.downloadLink} />
      </div>
      {!disabled && <div><span>{t('files_list.downloads')}</span>{downloadsCount}</div>}
      {/*<div>{row.deleteAfterFirstDownload ? <TrueIcon /> : <FalseIcon />}</div> */}
      <div><span>{t('files_list.columns.uploaded_at')}</span>{formatDate(row.uploadDate, i18n.resolvedLanguage ?? 'en')}</div>
      <div><span>{t('files_list.columns.expires_at')}</span>{formatDate(expiresAt, i18n.resolvedLanguage ?? 'en')}</div>
      <div>
        <span>{t('files_list.delete_button')}</span>
        <DeleteButton disabled={disabled} link={row.deleteLink} />
      </div>
    </div>
  )
}

function DownloadButton({ disabled, link }: {
  disabled: boolean
  link: string
}) {
  const url = new URL(link)
  const linkWithUTM = url.protocol + '//' + url.host + url.pathname + url.hash

  return (
    <Link
      href={linkWithUTM}
      tabIndex={disabled ? -1 : undefined}
      className={cx(styles.aLink, { [styles.disabled]: disabled })}
      rel='nofollow noreferrer'
      target='_blank'
    >
      <Button
        variant='dimmed'
        accent='green'
        iconButton
        disabled={disabled}
        tabIndex={-1}
      >
        <DownloadIcon />
      </Button>
    </Link>
  )
}

function DeleteButton({ disabled, link }: {
  disabled: boolean
  link: string
}) {
  return (
    <Link
      href={link}
      tabIndex={disabled ? -1 : undefined}
      className={cx(styles.aLink, { [styles.disabled]: disabled })}
      rel='nofollow noreferrer'
      target='_blank'
    >
      <Button
        variant='dimmed'
        accent='red'
        iconButton
        disabled={disabled}
        tabIndex={-1}
      >
        <DeleteIcon />
      </Button>
    </Link>
  )
}

const formatDate = (date: Date, locale: string) => {
  const dateFnsLocale = getDateFnsLocale(locale)
  return format(date, 'dd MMMM yyyy', { locale: dateFnsLocale }) + '\n' + format(date, 'HH:mm', {
    locale: dateFnsLocale
  })
}