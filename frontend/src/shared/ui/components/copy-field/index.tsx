import React from 'react'
import copy from 'copy-to-clipboard'
import styles from './styles.module.scss'
import IoCopyOutline from '$assets/icons/copy-outline.svg?react'
import IoCheckmark from '$assets/icons/check.svg?react'

export function CopyField({ children }: { children: string }) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = () => {
    copy(children)
    setCopied(true)
  }

  return (
    <pre 
      className={styles.copyField} 
      onClick={handleCopy}
      onPointerLeave={() => setCopied(false)}
    >
      {children} {copied ? <IoCheckmark className='inline-block' /> : <IoCopyOutline className='inline-block' />}
    </pre>
  )
}