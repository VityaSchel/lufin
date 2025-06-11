import React from 'react'

/**
 * This function combines useState with useRef independent from frame updates for async processes
 * @returns { s }
 */
export function useComplexState<StateValueType>(initialValue: StateValueType): [
  StateValueType,
  React.Dispatch<React.SetStateAction<StateValueType>>,
  React.MutableRefObject<StateValueType>
] {
  const [value, setValue] = React.useState(initialValue)
  const valueRef = React.useRef(value)
  React.useEffect(() => { valueRef.current = value }, [value])
  const handleChangeValue = (newValue: React.SetStateAction<StateValueType>) => {
    valueRef.current = typeof newValue === 'function'
      // @ts-expect-error idk how to fix
      ? newValue() 
      : newValue
    setValue(newValue)
  }
  return [value, handleChangeValue, valueRef]
}