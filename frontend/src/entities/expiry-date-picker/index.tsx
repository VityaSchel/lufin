import React from 'react'
import styles from './styles.module.scss'
import ClockIcon from './clock.svg'
import { StaticDateTimePicker } from '@mui/x-date-pickers/StaticDateTimePicker'
import {
  AppBar,
  Button,
  Dialog,
  DialogContent,
  FormHelperText,
  IconButton,
  Toolbar,
  Typography,
  useMediaQuery
} from '@mui/material'
import { TextField } from '$shared/ui/components/text-field'
import { format } from 'date-fns'
import CloseIcon from '@mui/icons-material/Close'
import Slide from '@mui/material/Slide'
import type { TransitionProps } from '@mui/material/transitions'
import { m } from '$m'

export function ExpiryDatePicker(props: {
  value: Date | null
  max: number
  error?: string
  onChange: (newDate: Date | null) => any
  disabled: boolean
}) {
  const { value, max, error, onChange, disabled } = props
  const [open, setOpen] = React.useState(false)

  return (
    <div className={styles.datePicker}>
      <TextField
        leftAdornment={<ClockIcon />}
        onClear={value === null ? undefined : () => onChange(null)}
        label={value === null ? undefined : m.expiration_dateOfExpiry()}
        value={
          value === null
            ? m.expiration_dateOfExpiryInput()
            : format(value, 'dd.MM.yyyy HH:mm:ss')
        }
        variant="outlined"
        readOnly
        wrapperProps={{
          onClick: () => setOpen(true)
        }}
        disabled={disabled}
      />
      {error && <FormHelperText error>{error}</FormHelperText>}
      <ResponsiveDialog open={open} onClose={() => setOpen(false)} {...props} />
    </div>
  )
}

function ResponsiveDialog({
  open,
  onClose,
  ...props
}: {
  open: boolean
  onClose: () => any
} & Parameters<typeof ExpiryDatePicker>['0']) {
  const isMobile = !useMediaQuery('(min-width: 768px)')
  const randomModalId = React.useRef<number | undefined>()

  React.useEffect(() => {
    const root = document.querySelector('html')
    if (root) {
      if (open) {
        if (randomModalId.current === undefined)
          randomModalId.current = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
        root.classList.add('scroll-lock-' + randomModalId.current)
      } else {
        root.classList.remove('scroll-lock-' + randomModalId.current)
      }
    }
  }, [open])

  return isMobile ? (
    <MobileDialog open={open} onClose={() => onClose()} {...props} />
  ) : (
    <StandaloneDialog open={open} onClose={() => onClose()} {...props} />
  )
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
  open,
  onClose,
  value,
  max,
  onChange,
  disabled
}: {
  open: boolean
  onClose: () => any
} & Parameters<typeof ExpiryDatePicker>['0']) {
  const [newValue, setNewValue] = React.useState<Date | null>(null)

  React.useEffect(() => {
    setNewValue(value)
  }, [value])

  React.useEffect(() => {
    !open && setNewValue(value)
  }, [open, value])

  const handleSave = () => {
    onChange(newValue)
    onClose()
  }

  return (
    <Dialog
      open={open}
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
            {m.expiration_selectExpiryDateLabel()}
          </Typography>
          <Button autoFocus color="inherit" onClick={handleSave}>
            {m.okButton()}
          </Button>
        </Toolbar>
      </AppBar>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
        <StaticDateTimePicker
          value={value}
          sx={{ width: '100%', flex: 1 }}
          disablePast
          onChange={(newDate) => onChange(newDate)}
          slots={{ actionBar: () => <></> }}
          maxDateTime={new Date(max)}
          displayStaticWrapperAs="mobile"
        />
      </DialogContent>
    </Dialog>
  )
}

function StandaloneDialog({
  open,
  onClose,
  value,
  max,
  onChange,
  disabled
}: {
  open: boolean
  onClose: () => any
} & Parameters<typeof ExpiryDatePicker>['0']) {
  const [newValue, setNewValue] = React.useState<Date | null>(null)

  React.useEffect(() => {
    setNewValue(value)
  }, [value])

  React.useEffect(() => {
    !open && setNewValue(value)
  }, [open, value])

  const handleSave = () => {
    onChange(newValue)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} scroll="paper">
      <DialogContent sx={{ padding: 0 }}>
        <StaticDateTimePicker
          value={newValue}
          sx={{ maxWidth: 300 }}
          disablePast
          onChange={(v) => setNewValue(v)}
          slots={{ actionBar: () => <></> }}
          maxDateTime={new Date(max)}
          displayStaticWrapperAs="mobile"
        />
        <Button fullWidth onClick={handleSave}>
          OK
        </Button>
      </DialogContent>
    </Dialog>
  )
}
