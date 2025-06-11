import React from 'react'
import styles from './styles.module.scss'
import cx from 'classnames'
import { m } from '$m'

export function DataTable<Row>({
  columns,
  rows,
  isLoading,
  renderRow
}: {
  columns: { label: React.ReactNode; centered?: boolean }[]
  rows: Row[]
  isLoading: boolean
  renderRow: (data: Row) => React.ReactNode
}) {
  return (
    <table className={styles.table}>
      <tbody>
        <tr>
          {columns.map((column, i) => (
            <th key={i} className={cx({ [styles.centered]: column.centered ?? true })}>
              {column.label}
            </th>
          ))}
        </tr>
        {isLoading ? (
          <tr>
            <td colSpan={columns.length} className={styles.loading}>
              {m['loading']()}
            </td>
          </tr>
        ) : rows.length ? (
          rows.map(renderRow)
        ) : (
          <tr>
            <td colSpan={columns.length} className={styles.loading}>
              {m['list_empty']()}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  )
}
