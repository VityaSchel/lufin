import styles from './styles.module.scss'
import cx from 'classnames'

export function Button({
  variant = 'contained',
  accent = 'default',
  className,
  children,
  iconButton,
  ...props
}: React.PropsWithChildren<{
  variant?: 'contained' | 'dimmed' | 'badge'
  accent?: 'default' | 'blue' | 'green' | 'red'
  className?: string
  iconButton?: boolean
}> &
  React.ButtonHTMLAttributes<HTMLButtonElement>): JSX.Element {
  return (
    <button
      type="button"
      {...props}
      className={cx(
        styles.button,
        {
          [styles.contained]: variant === 'contained',
          [styles.dimmed]: variant === 'dimmed',
          [styles.badge]: variant === 'badge',
          [styles.blueAccent]: accent === 'blue',
          [styles.greenAccent]: accent === 'green',
          [styles.redAccent]: accent === 'red',
          [styles.iconButton]: iconButton
        },
        className
      )}
    >
      {children}
    </button>
  )
}
