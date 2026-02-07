'use client'

import * as React from 'react'
import { images } from '@/assets'
import { cn } from '@/shared/lib/utils'

interface LogoProps extends React.HTMLAttributes<HTMLImageElement> {
  src?: string
}

export default function Logo({ className, src, ...props }: LogoProps) {
  return <img src={src || images.logo} alt="Logo" className={cn(className)} {...props} />
}
