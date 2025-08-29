import React from 'react'
import styles from './styles.module.scss'
import { normalizeFilename } from '$shared/utils/normalize-file-name'

export function RenamableTitle({
  value,
  onChange,
  readonly,
  placeholder,
  ariaLabel
}: {
  value: string
  onChange: (newValue: string) => any
  placeholder?: string
  readonly: boolean
  ariaLabel?: string
}) {
  const [inputValue, setInputValue] = React.useState('')
  const hiddenSpan = React.useRef<HTMLSpanElement>(null)
  const [inputWidth, setInputWidth] = React.useState(250)

  React.useEffect(() => {
    setInputValue(value)
  }, [value])

  const recalculateWidth = () =>
    setTimeout(() => {
      if (hiddenSpan.current) {
        setInputWidth(hiddenSpan.current.offsetWidth + 10 * 2 + 30)
      }
    }, 1)

  React.useEffect(() => {
    const timeout = recalculateWidth()
    return () => clearTimeout(timeout)
  }, [inputValue])

  React.useEffect(() => {
    if (hiddenSpan.current) {
      const observer = new ResizeObserver(() => recalculateWidth())
      observer.observe(hiddenSpan.current)
      return () => observer.disconnect()
    }
  }, [hiddenSpan.current])

  const handleBlur = () => {
    const fn = inputValue === '' ? '' : normalizeFilename(inputValue)
    setInputValue(fn)
    if (fn !== value) {
      onChange(fn)
    }
  }

  return (
    <div className={styles.container} onClick={(e) => e.stopPropagation()}>
      <span className={styles.hidden} ref={hiddenSpan}>
        {inputValue || placeholder}
      </span>
      <input
        type="text"
        value={inputValue}
        onBlur={handleBlur}
        onChange={(e) => setInputValue(e.target.value)}
        className={styles.renamableTitle}
        style={{ width: `min(${inputWidth}px, 100%)` }}
        maxLength={100}
        placeholder={placeholder}
        disabled={readonly}
        aria-label={ariaLabel}
      />
    </div>
  )
}
