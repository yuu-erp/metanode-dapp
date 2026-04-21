'use client'
import * as React from 'react'
import { cn } from '../lib/utils'

export function TypographyH1({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1 className={cn('scroll-m-20 text-4xl font-extrabold tracking-tight', className)} {...props}>
      {children}
    </h1>
  )
}
