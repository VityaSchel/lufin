import React from 'react'
import copy from 'copy-to-clipboard'
import styles from './styles.module.scss'
import { IoCopyOutline, IoCheckmark } from 'react-icons/io5'

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