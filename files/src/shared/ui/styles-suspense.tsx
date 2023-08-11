import { Box, Fade } from '@mui/material'
import React from 'react'

export function StylesSuspense({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = React.useState(false)

  React.useEffect(() => {
    const interval = setInterval(() => {
      const isAllCssLoaded = Array.from(document.styleSheets)
        .every(ss => 
          (ss.href && ss.href.startsWith(window.location.origin)) 
            ? ss.cssRules.length > 0 
            : true
        )
      if(isAllCssLoaded) {
        onLoaded()
      }
    })
    const timeout = setTimeout(() => {
      onLoaded()
    }, 1000 * 5)
    const onLoaded = () => {
      setIsLoaded(true)
      clearInterval(interval)
      clearTimeout(timeout)
    }
    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [])

  return (
    <div style={{ transition: 'opacity 100ms ease-out', opacity: isLoaded ? 1 : 0 }}>
      {children}
    </div>
  )
}