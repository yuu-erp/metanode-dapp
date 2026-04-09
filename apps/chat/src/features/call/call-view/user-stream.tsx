import { cn } from '@/shared/lib'
import { memo, forwardRef, type VideoHTMLAttributes } from 'react'

export const UserStream = memo(
  forwardRef<HTMLVideoElement, VideoHTMLAttributes<HTMLVideoElement> & {}>(
    ({ className, ...props }, ref) => {
      return (
        <video
          {...props}
          ref={ref}
          className={cn('object-contain bg-black rounded-lg border ', className)}
          playsInline
          autoPlay
        />
      )
    }
  )
)

UserStream.displayName = 'UserStream'
