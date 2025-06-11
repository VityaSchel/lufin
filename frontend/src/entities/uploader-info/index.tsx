import { Headline } from '$entities/headline'
import { m } from '$m'
import { Link } from '$shared/ui/link'
import Encryption from '$assets/encryption.svg'

export function UploaderInfo() {
  return (
    <div className="flex flex-col lg:flex-row gap-16 text-neutral-200 whitespace-pre-wrap [&_p]:leading-[160%] [&_p]:my-2">
      <div className="flex-[4]">
        <Headline variant="h4" className="mb-2">
          {m.termsFooter_expiration()}
        </Headline>
        <p>{m.uploadForm_text()}</p>
        {/*
        до 500MБ могут храниться до 30 дней,
        файлы размером более 500МБ загрузить нельзя
          */}
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
          <Link variant="highlighted" href="https://en.wikipedia.org/wiki/Web_Cryptography_API">
            WebCrypto
          </Link>{' '}
          {m.termsFooter_privacy_text().split(' $0 ')[1]}{' '}
          <Link
            variant="highlighted"
            href="https://en.wikipedia.org/wiki/Advanced_Encryption_Standard"
          >
            AES-CBC
          </Link>{' '}
          {m.termsFooter_privacy_text().split(' $0 ')[2]}{' '}
          <Link variant="highlighted" href="https://en.wikipedia.org/wiki/URI_fragment">
            hash
          </Link>{' '}
          {m.termsFooter_privacy_text().split(' $0 ')[3]}{' '}
          <Link variant="highlighted" href="https://en.wikipedia.org/wiki/Web_development_tools">
            DevTools
          </Link>
        </p>
        <p>{m.termsFooter_privacy_text2()}</p>
      </div>
      <div className="flex-[3] shrink-0">
        <Encryption />
      </div>
    </div>
  )
}
