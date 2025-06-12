import { MenuItem, Select } from '@mui/material'
import { getLocale, setLocale, type Locale } from '$paraglide/runtime'
import React from 'react'

const languagesMap = [
  { code: 'ru', flag: () => import('svg-country-flags/svg/ru.svg?react'), name: 'Русский' },
  { code: 'en', flag: () => import('svg-country-flags/svg/us.svg?react'), name: 'English' },
  { code: 'bg', flag: () => import('svg-country-flags/svg/bg.svg?react'), name: 'Български' },
  { code: 'cs', flag: () => import('svg-country-flags/svg/cz.svg?react'), name: 'Čeština' },
  { code: 'da', flag: () => import('svg-country-flags/svg/dk.svg?react'), name: 'Dansk' },
  { code: 'nl', flag: () => import('svg-country-flags/svg/nl.svg?react'), name: 'Nederlands' },
  { code: 'et', flag: () => import('svg-country-flags/svg/ee.svg?react'), name: 'Eesti' },
  { code: 'fi', flag: () => import('svg-country-flags/svg/fi.svg?react'), name: 'Suomi' },
  { code: 'fr', flag: () => import('svg-country-flags/svg/fr.svg?react'), name: 'Français' },
  { code: 'de', flag: () => import('svg-country-flags/svg/de.svg?react'), name: 'Deutsch' },
  { code: 'el', flag: () => import('svg-country-flags/svg/gr.svg?react'), name: 'Ελληνικά' },
  { code: 'hu', flag: () => import('svg-country-flags/svg/hu.svg?react'), name: 'Magyar' },
  { code: 'it', flag: () => import('svg-country-flags/svg/it.svg?react'), name: 'Italiano' },
  { code: 'lv', flag: () => import('svg-country-flags/svg/lv.svg?react'), name: 'Latviešu' },
  { code: 'lt', flag: () => import('svg-country-flags/svg/lt.svg?react'), name: 'Lietuvių' },
  { code: 'no', flag: () => import('svg-country-flags/svg/no.svg?react'), name: 'Norsk' },
  { code: 'pl', flag: () => import('svg-country-flags/svg/pl.svg?react'), name: 'Polski' },
  { code: 'pt', flag: () => import('svg-country-flags/svg/pt.svg?react'), name: 'Português' },
  { code: 'ro', flag: () => import('svg-country-flags/svg/ro.svg?react'), name: 'Română' },
  { code: 'sk', flag: () => import('svg-country-flags/svg/sk.svg?react'), name: 'Slovenčina' },
  { code: 'sl', flag: () => import('svg-country-flags/svg/si.svg?react'), name: 'Slovenščina' },
  { code: 'es', flag: () => import('svg-country-flags/svg/es.svg?react'), name: 'Español' },
  { code: 'sv', flag: () => import('svg-country-flags/svg/se.svg?react'), name: 'Svenska' },
  { code: 'tr', flag: () => import('svg-country-flags/svg/tr.svg?react'), name: 'Türkçe' }
] as const

export function LanguageSwitch() {
  return (
    <Select
      value={getLocale()}
      onChange={(e) => setLocale(e.target.value as Locale)}
      variant="outlined"
      size="small"
    >
      {languagesMap.map(({ code, flag, name }) => (
        <MenuItem value={code} key={code}>
          <div className="flex gap-2 items-center">
            <span className="flex justify-center items-center w-5 h-5">
              <React.Suspense fallback={<></>}>
                {(() => {
                  const LazyFlag = React.lazy(async () => {
                    const { default: FlagIcon } = await flag()
                    return { default: FlagIcon }
                  })
                  return <LazyFlag />
                })()}
              </React.Suspense>
            </span>
            <span>{name}</span>
          </div>
        </MenuItem>
      ))}
    </Select>
  )
}
