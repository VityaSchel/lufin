import React from 'react'
import styles from './styles.module.scss'
import cx from 'classnames'
import Check from './check.svg'

export function Checkbox({ value, name, onChange, children, disabled, ...props }: React.PropsWithChildren<{
  value: boolean
  name: string
  onChange: (isChecked: boolean) => any
  disabled?: boolean
}> & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'disabled'>) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleChange = () => {
    if (inputRef.current && !disabled) {
      inputRef.current.checked = !inputRef.current?.checked
      onChange(inputRef.current?.checked ?? false)
    }
  }

  return (
    <div className={cx(styles.checkbox, { [styles.disabled]: disabled })} onClick={handleChange}>
      <input
        ref={inputRef}
        type='checkbox'
        defaultChecked={value}
        className={styles.hidden}
        onChange={e => !disabled && onChange(e.target.checked)}
        name={name}
        id={name}
        disabled={disabled}
        {...props}
      />

      <span className={cx(styles.check, { [styles.checked]: value === true, [styles.disabled]: disabled })}>
        <Check />
      </span>
      <label htmlFor={name}>{children}</label>
    </div>
  )
}