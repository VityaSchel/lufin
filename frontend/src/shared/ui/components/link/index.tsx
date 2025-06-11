import styles from './styles.module.scss'
import { Link as ReactRouterLink } from 'react-router'
import cx from 'classnames'

export function Link({
  href,
  variant = 'default',
  className,
  children,
  ...props
}: React.PropsWithChildren<{
  href: string
  variant?: 'default' | 'dimmed' | 'highlighted' | 'underlined'
  className?: string
}> &
  Omit<React.ComponentProps<typeof ReactRouterLink>, 'to'>) {
  return (
    <ReactRouterLink
      to={href}
      className={cx(styles.link, className, {
        [styles.default]: variant === 'default',
        [styles.dimmed]: variant === 'dimmed',
        [styles.highlighted]: variant === 'highlighted',
        [styles.underlined]: variant === 'underlined'
      })}
      {...props}
    >
      {children}
    </ReactRouterLink>
  )
}
