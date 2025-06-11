import { MenuItem, Select } from '@mui/material'
import { getLocale, setLocale, type Locale } from '$paraglide/runtime'
import Flag from 'react-world-flags'

const languagesMap = [
  { code: 'ru', flag: 'ru', name: 'Русский' },
  { code: 'en', flag: 'us', name: 'English' },
  { code: 'bg', flag: 'bg', name: 'Български' },
  { code: 'cs', flag: 'cz', name: 'Čeština' },
  { code: 'da', flag: 'dk', name: 'Dansk' },
  { code: 'nl', flag: 'nl', name: 'Nederlands' },
  { code: 'et', flag: 'ee', name: 'Eesti' },
  { code: 'fi', flag: 'fi', name: 'Suomi' },
  { code: 'fr', flag: 'fr', name: 'Français' },
  { code: 'de', flag: 'de', name: 'Deutsch' },
  { code: 'el', flag: 'gr', name: 'Ελληνικά' },
  { code: 'hu', flag: 'hu', name: 'Magyar' },
  { code: 'it', flag: 'it', name: 'Italiano' },
  { code: 'lv', flag: 'lv', name: 'Latviešu' },
  { code: 'lt', flag: 'lt', name: 'Lietuvių' },
  { code: 'no', flag: 'no', name: 'Norsk' },
  { code: 'pl', flag: 'pl', name: 'Polski' },
  { code: 'pt', flag: 'pt', name: 'Português' },
  { code: 'ro', flag: 'ro', name: 'Română' },
  { code: 'sk', flag: 'sk', name: 'Slovenčina' },
  { code: 'sl', flag: 'si', name: 'Slovenščina' },
  { code: 'es', flag: 'es', name: 'Español' },
  { code: 'sv', flag: 'se', name: 'Svenska' },
  { code: 'tr', flag: 'tr', name: 'Türkçe' }
]

export function LanguageSwitch() {
  return (
    <Select value={getLocale()} onChange={(e) => setLocale(e.target.value as Locale)}>
      {languagesMap.map(({ code, flag, name }) => (
        <MenuItem value={code} key={code}>
          <div className="flex gap-2 items-center">
            <Flag code={flag} width={20} height={20} />
            <span>{name}</span>
          </div>
        </MenuItem>
      ))}
    </Select>
  )
}
