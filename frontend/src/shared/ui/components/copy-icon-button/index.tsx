import React from 'react'
import { IconButton } from '@mui/material'
import copy from 'copy-to-clipboard'
import MdContentCopy from '$assets/icons/copy-content.svg?react'
import MdDone from '$assets/icons/done.svg?react'

export function CopyIconButton({ content }: { content: string }) {
  const [isCopied, setIsCopied] = React.useState(false)

  return (
    <IconButton
      onClick={() => {
        setIsCopied(true)
        copy(content)
      }}
      onPointerLeave={() => setIsCopied(false)}
    >
      {isCopied ? <MdDone /> : <MdContentCopy />}
    </IconButton>
  )
}
