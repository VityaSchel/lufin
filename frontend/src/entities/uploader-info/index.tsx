import { Headline } from '$entities/headline'
import { m } from '$m'
import { Link } from '$shared/ui/components/link'
import React from 'react'
import { CircularProgress } from '@mui/material'
import filesize from 'byte-size'
import { getLocale } from '$paraglide/runtime'
import { formatDistanceStrict } from 'date-fns'
import { getDateFnsLocale } from '$shared/utils/get-date-fns-locale'
import { getLimits } from '$app/api'

export function UploaderInfo() {
  const [limits, setLimits] = React.useState<{ limit: number; seconds: number }[] | null | 'error'>(
    null
  )

  React.useEffect(() => {
    getLimits().then(setLimits)
  }, [])

  const maxUploadSize = limits === 'error' ? undefined : limits?.at(-1)?.limit

  return (
    <div className="flex flex-col lg:flex-row gap-16 text-neutral-200 whitespace-pre-wrap [&_p]:leading-[160%] [&_p]:my-2">
      <div className="flex-4">
        <Headline variant="h4" className="mb-2">
          {m.termsFooter_expiration()}
        </Headline>
        <p>{m.uploadForm_text()}</p>
        <div className="mt-6">
          {limits === null ? (
            <CircularProgress />
          ) : limits === 'error' ? (
            '[Error while fetching limits]'
          ) : limits.length === 0 ? (
            'N/A'
          ) : (
            <ul className="">
              {limits.map(({ limit, seconds }, i) => (
                <li key={i}>
                  &lt;= {filesize(limit * 1000 * 1000, { locale: getLocale() }).toString()}:{' '}
                  {formatDistanceStrict(seconds * 1000, 0, {
                    locale: getDateFnsLocale(getLocale())
                  })}
                </li>
              ))}
              {maxUploadSize !== undefined && maxUploadSize !== Infinity && (
                <li>
                  &gt;{filesize(maxUploadSize * 1000 * 1000, { locale: getLocale() }).toString()}:
                  🚫
                </li>
              )}
            </ul>
          )}
        </div>
        <Headline variant="h4" className="mt-6 mb-2">
          {m.termsFooter_howItWorks_title()}
        </Headline>
        <p>{m.termsFooter_howItWorks_text()}</p>
        <p>{m.termsFooter_howItWorks_text2()}</p>
        <p>{m.termsFooter_howItWorks_text3()}</p>
        <Headline variant="h4" className="mt-6 mb-2">
          {m.termsFooter_privacy_title()}
        </Headline>
        <p className="inline">
          {m.termsFooter_privacy_text().split(' $0 ')[0]}{' '}
          <Link
            variant="highlighted"
            href="https://en.wikipedia.org/wiki/Web_Cryptography_API"
            className="font-medium"
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            WebCrypto
          </Link>{' '}
          {m.termsFooter_privacy_text().split(' $0 ')[1]}{' '}
          <Link
            variant="highlighted"
            href="https://en.wikipedia.org/wiki/Advanced_Encryption_Standard"
            className="font-medium"
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            AES-CBC
          </Link>{' '}
          {m.termsFooter_privacy_text().split('$0')[2]}
          <Link
            variant="highlighted"
            href="https://en.wikipedia.org/wiki/URI_fragment"
            className="font-medium"
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            hash
          </Link>
          {m.termsFooter_privacy_text().split('$0')[3]}
          <Link
            variant="highlighted"
            href="https://en.wikipedia.org/wiki/Web_development_tools"
            className="font-medium"
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            DevTools
          </Link>
          {m.termsFooter_privacy_text().split('$0')[4]}
        </p>
        <p>{m.termsFooter_privacy_text2()}</p>
      </div>
      <div className="flex-3 shrink-0">
        <img src="/encryption.svg" />
      </div>
    </div>
  )
}
