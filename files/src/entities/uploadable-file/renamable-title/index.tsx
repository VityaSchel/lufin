import React from 'react'
import styles from './styles.module.scss'
import { getRandomFileName, normalizeFilename } from '@/shared/utils/normalize-file-name'

export function RenamableTitle({ value, onChange, readonly, placeholder }: {
  value: string
  onChange: (newValue: string) => any
  placeholder?: string
  readonly: boolean
}) {
  const [inputValue, setInputValue] = React.useState('')
  // const inputRef = React.useRef<HTMLInputElement>(null)
  const hiddenSpan = React.useRef<HTMLSpanElement>(null)
  const [inputWidth, setInputWidth] = React.useState(250)

  React.useEffect(() => {
    setInputValue(value)
  }, [value])

  const recalculateWidth = () => {
    setTimeout(() => {
      if (hiddenSpan.current) {
        setInputWidth(hiddenSpan.current.offsetWidth + 10*2 + 30)
      }
    }, 1)
  }

  React.useEffect(() => { recalculateWidth() }, [inputValue])

  const handleBlur = () => {
    const fn = inputValue === '' ? '' : normalizeFilename(inputValue)
    setInputValue(fn)
    if (fn !== value) {
      onChange(fn)
    }
  }

  return (
    <div className={styles.container} onClick={e => e.stopPropagation()}>
      <span 
        className={styles.hidden}
        ref={hiddenSpan}
      >{inputValue || placeholder}</span>
      <input 
        // ref={inputRef}
        type="text" 
        value={inputValue} 
        onBlur={handleBlur} 
        onChange={e => setInputValue(e.target.value)}
        // onInput={() => recalculateWidth()}
        className={styles.renamableTitle}
        style={{ width: `min(${inputWidth}px, 100%)` }}
        maxLength={100}
        placeholder={placeholder}
        disabled={readonly}
      />
    </div>
  )
}