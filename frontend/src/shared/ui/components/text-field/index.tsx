import React from 'react'
import styles from './styles.module.scss'
import ClearIcon from './clear.svg'
import cx from 'classnames'

export function TextField({
  variant = 'default',
  label,
  value,
  onClear,
  leftAdornment,
  rightAdornment,
  wrapperProps,
  className,
  disabled,
  ...props
}: {
  variant: 'default' | 'outlined'
  value?: string
  label?: string
  onClear?: () => any
  leftAdornment?: React.ReactNode
  rightAdornment?: React.ReactNode
  wrapperProps?: React.InputHTMLAttributes<HTMLInputElement>
  className?: string
  disabled?: boolean
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const [isFocused, setIsFocused] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // TODO: remove code below
  // React.useEffect(() => {
  //   if (disabled && inputRef.current && document.activeElement === inputRef.current) {
  //     inputRef.current.focus()
  //   }
  // }, [disabled, inputRef])

  return (
    <div
      className={cx(
        styles.textField,
        {
          [styles.default]: variant === 'default',
          [styles.outlined]: variant === 'outlined',
          [styles.withLabel]: Boolean(label),
          [styles.focused]: isFocused,
          [styles.disabled]: disabled
        },
        className
      )}
      {...wrapperProps}
    >
      {leftAdornment && <span className={styles.leftAdornment}>{leftAdornment}</span>}
      <div className={styles.input}>
        {label && <span className={styles.label}>{label}</span>}
        <input
          value={value}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          ref={inputRef}
          {...props}
        />
        {onClear && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClear()
            }}
            className={styles.clearButton}
            tabIndex={value ? undefined : -1}
            type="button"
            disabled={disabled}
          >
            <ClearIcon />
          </button>
        )}
      </div>
      {rightAdornment}
    </div>
  )
}
