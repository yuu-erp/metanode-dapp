'use client'

import * as React from 'react'

import { cn } from '@/shared/lib/utils'

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: React.ReactNode
}

const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ className, src, alt, fallback, onError, ...props }, ref) => {
    const [hasError, setHasError] = React.useState(false)

    React.useEffect(() => {
      setHasError(false)
    }, [src])

    const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setHasError(true)
      onError?.(event)
    }

    if (hasError && fallback) {
      if (React.isValidElement(fallback)) {
        return fallback
      }
      if (typeof fallback === 'string') {
        return <img className={className} src={fallback} alt={alt} ref={ref} {...props} />
      }
    }

    return (
      <img
        className={cn(className)}
        src={src}
        alt={alt}
        ref={ref}
        onError={handleError}
        {...props}
      />
    )
  }
)
Image.displayName = 'Image'

export { Image }
