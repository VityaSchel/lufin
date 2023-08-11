import { MenuItem, Select } from '@mui/material'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import Flag from 'react-world-flags'
import Cookies from 'js-cookie'
import React from 'react'

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
  const { i18n } = useTranslation()
  const router = useRouter()
  const ranEffect = React.useRef(false)

  React.useEffect(() => {
    if (ranEffect.current) {
      return
    }
    ranEffect.current = true
    const urlParts = window.location.pathname.split('/')
    const pageLanguagePart = urlParts[1]
    let pageLanguage: string | undefined
    if (pageLanguagePart && pageLanguagePart.length === 2 && languagesMap.some(({ code }) => code === pageLanguagePart)) {
      pageLanguage = pageLanguagePart
    }
    if (pageLanguage === undefined) {
      let preferredLocale = Cookies.get('NEXT_LOCALE')
      if(!preferredLocale) {
        preferredLocale = navigator.language.slice(0, 2)
        if(!languagesMap.some(({ code }) => code === preferredLocale)) {
          preferredLocale = 'en'
        }
      }
      handleChangeLanguage(preferredLocale)
    }
  }, [])

  const handleChangeLanguage = (language: string) => {
    router.push({
      pathname: router.pathname,
      query: router.query,
    }, router.asPath, { locale: language })
    Cookies.set('NEXT_LOCALE', language, {
      expires: 365
    })
  }

  return (
    <Select
      value={i18n.resolvedLanguage}
      onChange={(e) => handleChangeLanguage(e.target.value as string)}
    >
      {languagesMap.map(({ code, flag, name }) => (
        <MenuItem value={code} key={code}>
          <div className='flex gap-2 items-center'>
            <Flag code={flag} width={20} height={20} />
            <span>{name}</span>
          </div>
        </MenuItem>
      ))}
    </Select>
  )
}