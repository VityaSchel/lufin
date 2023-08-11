import Icon from '@mdi/react'
import styles from './styles.module.scss'
import { Headline } from '@/entities/headline'
import { mdiLockQuestion } from '@mdi/js'
import { useTranslation } from 'next-i18next'

export function DecryptionKeyError() {
  const { t } = useTranslation('filesharing')

  return (
    <section className={styles.error}>
      <span className={styles.icon}><Icon path={mdiLockQuestion} size={3} /></span>
      <Headline variant='h2'>{t('decryption.key_invalid')}</Headline>
      <p dangerouslySetInnerHTML={{ __html: t('decryption.key_invalid_hint1') }} />
      <p dangerouslySetInnerHTML={{ __html: t('decryption.key_invalid_hint2') }} />
    </section>
  )
}