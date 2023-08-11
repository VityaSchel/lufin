import React from 'react'
import { IconButton } from '@mui/material'
import copy from 'copy-to-clipboard'
import { MdContentCopy, MdDone } from 'react-icons/md'

export function CopyIconButton({ content }: {
  content: string
}) {
  const [isCopied, setIsCopied] = React.useState(false)

  return (
    <IconButton 
      onClick={() => { setIsCopied(true); copy(content) }}
      onPointerLeave={() => setIsCopied(false)}
    >
      {isCopied ? <MdDone /> : <MdContentCopy />}
    </IconButton>
  )
}