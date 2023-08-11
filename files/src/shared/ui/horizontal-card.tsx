const HorizontalCard = (props: Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> & { 
  icon?: any
  subtitle?: any
  title?: any
}) => <div {...props} />
export { HorizontalCard } 