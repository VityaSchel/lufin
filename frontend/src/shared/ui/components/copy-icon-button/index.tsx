import React from 'react'
import { IconButton } from '@mui/material'
import copy from 'copy-to-clipboard'
import MdContentCopy from '$assets/icons/copy-outline.svg?react'
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
      {isCopied ? <MdDone width={28} height={28} /> : <MdContentCopy width={28} height={28} />}
    </IconButton>
  )
}
