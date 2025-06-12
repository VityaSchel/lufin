import React from 'react'
import styles from './styles.module.scss'
import copy from 'copy-to-clipboard'
import MdContentCopy from '$assets/icons/copy-content.svg?react'
import MdDone from '$assets/icons/done.svg?react'
import { Button } from '../button'
import cx from 'classnames'

export function CopyButton({ content, className, children, ...props }: React.PropsWithChildren<{
  className?: string
  content: string
}>) {
  const [isCopied, setIsCopied] = React.useState(false)

  return (
    <Button
      variant='dimmed'
      onClick={() => { setIsCopied(true); copy(content) }}
      onPointerLeave={() => setIsCopied(false)}
      className={cx(styles.copyButton, className)}
      {...props}
    >
      <span style={{ opacity: isCopied ? 1 : 0 }}>
        <MdDone />
      </span>
      <span style={{ opacity: isCopied ? 0 : 1 }}>
        <MdContentCopy /> {children}
      </span>
    </Button>
  )
}