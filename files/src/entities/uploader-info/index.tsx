import { Headline } from '@/entities/headline'
import { useTranslation } from 'next-i18next'
import { Link } from '@/shared/ui/link'
import Encryption from '@/assets/encryption.svg'

export function UploaderInfo() {
  const { t } = useTranslation('filesharing')
  return (
    <div className='flex flex-col lg:flex-row gap-16 text-neutral-200 whitespace-pre-wrap [&_p]:leading-[160%] [&_p]:my-2'>
      <div className='flex-[4]'>
        <Headline variant='h4' className='mb-2'>{t('terms_footer.expiration')}</Headline>
        <p>
          {t('upload_form.text')}
        </p>
        {/*
        до 500MБ могут храниться до 30 дней,
        файлы размером более 500МБ загрузить нельзя
          */}
        <Headline variant='h4' className='mt-6 mb-2'>{t('terms_footer.how_it_works.title')}</Headline>
        <p>
          {t('terms_footer.how_it_works.text')}
        </p>
        <p>
          {t('terms_footer.how_it_works.text2')}
        </p>
        <p>
          {t('terms_footer.how_it_works.text3')}
        </p>
        <Headline variant='h4' className='mt-6 mb-2'>{t('terms_footer.privacy.title')}</Headline>
        <p className='inline'>
          {t('terms_footer.privacy.text').split(' $0 ')[0]} <Link variant='highlighted' href='https://en.wikipedia.org/wiki/Web_Cryptography_API'>WebCrypto</Link> {t('terms_footer.privacy.text').split(' $0 ')[1]} <Link variant='highlighted' href='https://en.wikipedia.org/wiki/Advanced_Encryption_Standard'>AES-CBC</Link> {t('terms_footer.privacy.text').split(' $0 ')[2]} <Link variant='highlighted' href='https://en.wikipedia.org/wiki/URI_fragment'>hash</Link> {t('terms_footer.privacy.text').split(' $0 ')[3]} <Link variant='highlighted' href='https://en.wikipedia.org/wiki/Web_development_tools'>DevTools</Link>
        </p>
        <p>
          {t('terms_footer.privacy.text2')}
        </p>
      </div>
      <div className='flex-[3] shrink-0'>
        <Encryption />
      </div>
    </div>
  )
}