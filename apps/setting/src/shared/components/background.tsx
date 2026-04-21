'use client'
import * as React from 'react'
import { handleBackground } from '../utils'
import { images } from '@/assets/images'

interface BackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  backgroundUrl?: string
}
function Background({ backgroundUrl = '', style, ...props }: BackgroundProps) {
  return (
    <div
      className="fixed inset-0 -z-[1]"
      style={{
        background: handleBackground(backgroundUrl, images.backgroundDefault),
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 150ms ease',
        filter: 'blur(24px)',
        transform: 'scale(1.1)'
      }}
      {...props}
    ></div>
  )
}

export default React.memo(Background)
