import React from 'react'
import styles from './styles.module.scss'
import { Button } from '$shared/ui/components/button'
import MdWrapText from '$assets/icons/wrap-text.svg?react'
import cx from 'classnames'
import plural from 'plural-ru'
import GraphemeSplitter from 'grapheme-splitter'
import { m } from '$m'

export function PreviewText({ file }: { file: File }) {
  const [text, setText] = React.useState<null | string>(null)

  React.useEffect(() => {
    const reader = new FileReader()
    reader.addEventListener('load', (e) => {
      if (e.target) {
        const result = e.target.result
        if (typeof result === 'string') {
          setText(result)
        } else if (result !== null) {
          const enc = new TextDecoder('utf-8')
          setText(enc.decode(result))
        }
      }
    })
    reader.readAsText(file)
  }, [file])

  return text === null ? <span>{m.loading()}...</span> : <Previewer text={text} />
}

function Previewer({ text }: { text: string }) {
  const [wrapText, setWrapText] = React.useState(false)
  const linesNum = (text.match(/\n/g) || '').length + 1
  const chars = React.useMemo(() => new GraphemeSplitter().splitGraphemes(text).length, [text])
  const length = React.useMemo(() => text.length, [text])

  return (
    <div className={styles.previewText}>
      <div className={styles.top}>
        <span>
          {linesNum} {plural(linesNum, m.lines_one(), m.lines_few(), m.lines_many())}
        </span>
        •
        <span>
          {chars} {plural(chars, m.char_one(), m.char_few(), m.char_many())} ({length}{' '}
          {plural(length, m.codePoint_one(), m.codePoint_few(), m.codePoint_many())})
        </span>
        <Button
          variant={wrapText ? 'contained' : 'dimmed'}
          iconButton
          onClick={() => setWrapText(!wrapText)}
          type="button"
          className={styles.wrapTextButton}
        >
          <MdWrapText />
        </Button>
      </div>
      <div className={styles.textContainer}>
        <pre className={cx(styles.pre, { [styles.wrap]: wrapText })}>{text}</pre>
      </div>
    </div>
  )
}
