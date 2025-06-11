import styles from './styles.module.scss'
import cx from 'classnames'

export function HorizontalCard({ icon, title, subtitle, onClick }: {
  icon: React.ReactNode
  title: React.ReactNode
  subtitle: string
  onClick?: () => any
}) {
  return (
    <div className={cx(styles.card, { [styles.focusable]: Boolean(onClick) })} tabIndex={onClick ? 0 : undefined} onClick={onClick}>
      <span className={styles.icon}>
        {icon}
      </span>
      <div className={styles.info}>
        {typeof title === 'string' 
          ? <span className={styles.title} title={title}>{title}</span>
          : title
        }
        <span className={styles.subtitle}>{subtitle}</span>
      </div>
    </div>
  )
}