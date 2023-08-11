import React from 'react'
import { AppBar, Button, Dialog, DialogActions, DialogTitle, IconButton, Slide, Toolbar, Typography, useMediaQuery } from '@mui/material'
import { TransitionProps } from '@mui/material/transitions'
import CloseIcon from '@mui/icons-material/Close'

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />
})

export function ResponsiveMUIDialog({ open, onClose, title, className, actions, children }: React.PropsWithChildren<{
  open: boolean
  onClose: () => any
  title: string
  actions?: React.ReactNode
  className?: string
}>) {
  const isMobile = useMediaQuery('(max-width: 768px)')

  const randomModalID = React.useRef<number | undefined>()

  React.useEffect(() => {
    const root = document.querySelector('html')
    if (root) {
      if (open) {
        if (randomModalID.current === undefined) randomModalID.current = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
        root.classList.add('scroll-lock-' + randomModalID.current)
      } else {
        root.classList.remove('scroll-lock-' + randomModalID.current)
      }
    }
  }, [open])

  React.useEffect(() => {
    return () => {
      document.querySelector('html')?.classList.remove('scroll-lock-' + randomModalID.current)
    }
  }, [])

  return (
    <Dialog
      fullScreen={isMobile}
      open={open}
      onClose={onClose}
      TransitionComponent={isMobile ? Transition : undefined}
      PaperProps={{ className }}
    >
      {isMobile && (
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={onClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              {title}
            </Typography>
            {actions}
          </Toolbar>
        </AppBar>
      )}
      {!isMobile && <DialogTitle>{title}</DialogTitle>}
      {children}
      {!isMobile && (actions ?? (
        <DialogActions>
          <Button onClick={onClose}>OK</Button>
        </DialogActions>
      ))}
    </Dialog>
  )
}