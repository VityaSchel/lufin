import styles from './styles.module.scss'
import NextLink from 'next/link'
import cx from 'classnames'

export function Link({ href, variant = 'default', className, children, ...props }: React.PropsWithChildren<{
  href: string
  variant?: 'default' | 'dimmed' | 'highlighted' | 'underlined'
  className?: string
}> & React.ComponentProps<typeof NextLink>) {
  return (
    <NextLink 
      href={href} 
      className={
        cx(styles.link, className, {
          [styles.default]: variant === 'default',
          [styles.dimmed]: variant === 'dimmed',
          [styles.highlighted]: variant === 'highlighted',
          [styles.underlined]: variant === 'underlined',
        })
      }
      {...props}
    >
      {children}
    </NextLink>
  )
}