import { Button } from '@/shared/ui/components/button'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

export function FilesDeletionConfirmation() {
  const { t } = useTranslation('filesharing')
  const router = useRouter()

  const handleDelete = () => {
    router.push({ query: { ...router.query, confirm: '1' } }, undefined, { shallow: false })
  }

  return (
    <section className='flex flex-col justify-center items-center gap-4 h-96'>
      <h1>{t('delete_confirmation.title')}</h1>
      <p>{t('delete_confirmation.label')}</p>
      <Button onClick={handleDelete}>{t('delete_confirmation.confirm_button')}</Button>
    </section>
  )
}