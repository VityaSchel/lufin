import { createTheme } from '@mui/material/styles'
import { red } from '@mui/material/colors'
import { enUS as muiMaterialEnLocale } from '@mui/material/locale'
import { enUS as muiDatePickersEnLocale } from '@mui/x-date-pickers/locales'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: 'rgba(36, 139, 218, 1)',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: red.A400,
    },
  }
}, muiMaterialEnLocale, muiDatePickersEnLocale)

export default theme