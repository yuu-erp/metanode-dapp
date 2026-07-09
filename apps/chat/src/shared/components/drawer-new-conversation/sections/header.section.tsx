'use client'
import { cn } from '@/shared/lib'
import * as React from 'react'

interface HeaderSectionProps extends React.HTMLAttributes<HTMLDivElement> {}
export default function HeaderSection({ className, children, ...props }: HeaderSectionProps) {
  return (
    <div
      className={cn(
        'w-full fixed left-0 right-0 top-0 pt-6 pb-3 flex flex-col gap-5 z-10',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
