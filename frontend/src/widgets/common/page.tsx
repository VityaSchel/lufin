import React from 'react'
import { AppBar } from './nav'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import cx from 'classnames'
import { UploaderInfo } from '$entities/uploader-info'
import { FilesPageWarning } from '$widgets/files-page-warning'
import { Helmet } from 'react-helmet-async'
import { m } from '$m'

export function PageContainer({ children }: React.PropsWithChildren) {
  return (
    <div className="w-full flex flex-col items-center gap-[30px]" id="container">
      <Helmet>
        <title>Lufin {m.title()}</title>
        <meta rel="description" content={m.description()} />
      </Helmet>
      <AppBar />
      <main className="w-[1200px] max-w-full px-[15px] pb-24 flex flex-col gap-[30px]">
        {children}
      </main>
      <Footer />
    </div>
  )
}

function Footer() {
  const [expanded, setExpanded] = React.useState(false)
  const randomModalId = React.useRef<number | undefined>()

  React.useEffect(() => {
    const root = document.querySelector('html')
    if (root) {
      if (expanded) {
        if (randomModalId.current === undefined)
          randomModalId.current = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
        root.classList.add('scroll-lock-' + randomModalId.current)
      } else {
        root.classList.remove('scroll-lock-' + randomModalId.current)
      }
    }
  }, [expanded])

  return (
    <footer
      className={cx(
        'fixed bottom-0 w-full left-0 bg-[#393939] shadow-[0px_-1px_5px_0px_rgba(18,18,18,0.3)] transition-all max-h-screen flex flex-col',
        {
          'h-full': expanded,
          'h-[64px]': !expanded
        }
      )}
    >
      <button
        className="h-16 w-full flex items-center justify-between bg-[#272727] text-white px-6 shadow-md shadow-[linear-gradient(rgba(255,255,255,0.092),rgba(255,255,255,0.092))] shrink-0 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="font-medium font-default text-base md:text-xl">
          {m.termsFooter_title()}
        </span>
        <span
          className={cx('transition-transform', {
            'transform rotate-180': expanded,
            'transform rotate-0': !expanded
          })}
        >
          <KeyboardArrowUpIcon fontSize="large" />
        </span>
      </button>
      <div className="p-6 md:p-12 overflow-auto flex-1">
        <UploaderInfo />
        <FilesPageWarning />
      </div>
    </footer>
  )
}
