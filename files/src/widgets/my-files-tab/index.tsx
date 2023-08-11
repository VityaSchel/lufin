import { LocalStorageActions } from '@/features/localstorage-actions'
import styles from './styles.module.scss'
import { FilesList } from '@/features/files-list'
import { useTranslation } from 'next-i18next'

export function MyFilesTab() {
  const { t } = useTranslation('filesharing')

  return (
    <div className={styles.myFiles}>
      <div className={styles.top}>
        <p>{t('files_list.hint')}</p>
        <LocalStorageActions />
      </div>
      <FilesList />
    </div>
  )
}