
export default function PageNotFound() {
  const { t } = useTranslation('filesharing')

  return (
    <div className='flex items-center justify-center h-[calc(100vh-230px)]'>
      <h1>{t('page_not_found')}</h1>
    </div>
  )
}