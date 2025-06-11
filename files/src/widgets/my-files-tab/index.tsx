import { LocalStorageActions } from '$features/localstorage-actions'
import styles from './styles.module.scss'
import { FilesList } from '$features/files-list'
import { m } from '$m'

export function MyFilesTab() {
  return (
    <div className={styles.myFiles}>
      <div className={styles.top}>
        <p>{m.filesList_hint()}</p>
        <LocalStorageActions />
      </div>
      <FilesList />
    </div>
  )
}
