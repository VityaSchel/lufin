import React from "react"
import { useTranslation } from 'next-i18next'

export default function HomePage() {
  const { i18n } = useTranslation('filesharing')
  const ranEffect = React.useRef(false)

  React.useEffect(() => {
    if (ranEffect.current) {
      return
    }
    ranEffect.current = true
    window.location.href = (i18n.language ?? 'en') + '/files'
  }, [])

  return (
    <div></div>
  )
}