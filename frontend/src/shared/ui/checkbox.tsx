const Checkbox = ({ children, value, ...props }: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value'> & {
  value: boolean
  variant?: any
  iconButton?: any
}) => <div>
  <input type='checkbox' defaultChecked={value} {...props} />
  <label>{children}</label>
</div>
export { Checkbox } 