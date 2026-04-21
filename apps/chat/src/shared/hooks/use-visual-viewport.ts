import { useEffect, useState } from 'react'

export function useVisualViewport() {
  const [height, setHeight] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return

    const handleResize = () => {
      setHeight(window.visualViewport?.height)
    }

    // Set initial
    handleResize()

    window.visualViewport.addEventListener('resize', handleResize)
    return () => window.visualViewport?.removeEventListener('resize', handleResize)
  }, [])

  return height
}
