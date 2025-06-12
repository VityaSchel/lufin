import styles from './styles.module.scss'
import { Headline } from '$entities/headline'
import LockQuestion from '$assets/icons/lock-question.svg?react'
import { m } from '$m'

export function DecryptionKeyError() {
  return (
    <section className={styles.error}>
      <span className={styles.icon}>
        <LockQuestion />
      </span>
      <Headline variant="h2">{m.decryption_keyInvalid()}</Headline>
      <p dangerouslySetInnerHTML={{ __html: m.decryption_keyInvalidHint1() }} />
      <p dangerouslySetInnerHTML={{ __html: m.decryption_keyInvalidHint2() }} />
    </section>
  )
}
