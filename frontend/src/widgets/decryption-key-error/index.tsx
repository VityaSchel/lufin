import Icon from '@mdi/react'
import styles from './styles.module.scss'
import { Headline } from '$entities/headline'
import { mdiLockQuestion } from '@mdi/js'
import { m } from '$m'

export function DecryptionKeyError() {
  return (
    <section className={styles.error}>
      <span className={styles.icon}>
        <Icon path={mdiLockQuestion} size={3} />
      </span>
      <Headline variant="h2">{m.decryption_keyInvalid()}</Headline>
      <p dangerouslySetInnerHTML={{ __html: m.decryption_keyInvalidHint1() }} />
      <p dangerouslySetInnerHTML={{ __html: m.decryption_keyInvalidHint2() }} />
    </section>
  )
}
