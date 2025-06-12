import {
  AppBar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Slide,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import React from 'react'
import type { TransitionProps } from '@mui/material/transitions'
import { m } from '$m'

export function PasswordInputDialog(props: {
  visible: boolean
  onClose: () => any
  onSubmit: (password: string) => any
}) {
  const isMobile = !useMediaQuery('(min-width: 768px)')
  const randomModalId = React.useRef<number | undefined>()

  React.useEffect(() => {
    const root = document.querySelector('html')
    if (root) {
      if (props.visible) {
        if (randomModalId.current === undefined)
          randomModalId.current = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
        root.classList.add('scroll-lock-' + randomModalId.current)
      } else {
        root.classList.remove('scroll-lock-' + randomModalId.current)
      }
    }
  }, [props.visible])

  return isMobile ? <MobileDialog {...props} /> : <StandaloneDialog {...props} />
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />
})

function MobileDialog({
  visible,
  onClose,
  onSubmit
}: {
  visible: boolean
  onClose: () => void
  onSubmit: (password: string) => void
}) {
  const [passwordValue, setPasswordValue] = React.useState('')

  const handleSubmit = () => {
    onSubmit(passwordValue)
  }

  return (
    <Dialog
      open={visible}
      onClose={onClose}
      scroll="paper"
      fullScreen
      TransitionComponent={Transition}
    >
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            {m.uploadForm_addPasswordTitle()}
          </Typography>
          <Button autoFocus color="inherit" onClick={handleSubmit}>
            {m.okButton()}
          </Button>
        </Toolbar>
      </AppBar>
      <DialogContent>
        <div className="h-[calc(100vh-100px)] flex items-center">
          <TextField
            fullWidth
            placeholder={m.passwordProtection_passwordInput()}
            value={passwordValue}
            onChange={(e) => setPasswordValue(e.target.value as string)}
            autoComplete="off"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

function StandaloneDialog({
  visible,
  onClose,
  onSubmit
}: {
  visible: boolean
  onClose: () => any
  onSubmit: (password: string) => any
}) {
  const [passwordValue, setPasswordValue] = React.useState('')

  const handleSubmit = () => {
    onSubmit(passwordValue)
  }

  return (
    <Dialog open={visible} onClose={onClose} scroll="paper">
      <DialogTitle>{m.uploadForm_addPasswordTitle()}</DialogTitle>
      <DialogContent>
        <TextField
          placeholder={m.passwordProtection_passwordInput()}
          value={passwordValue}
          onChange={(e) => setPasswordValue(e.target.value as string)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSubmit}>OK</Button>
      </DialogActions>
    </Dialog>
  )
}
