import cx from 'classnames'
import styles from './styles.module.scss'

export function Progress({ progress }: {
  progress: number | null
}) {
  return (
    <div
      className={cx(styles.progress, { [styles.visible]: progress !== null })}
      style={{ width: `${progress ?? 0}%` }}
    />
  )
}