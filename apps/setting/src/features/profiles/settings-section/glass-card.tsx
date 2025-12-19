'use client'
import { cn } from '@/shared/lib/utils'
import * as React from 'react'

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {}
function GlassCard({ className, children, ...props }: GlassCardProps) {
  return (
    <React.Fragment>
      <div className={cn('w-full p-5 background-card rounded-2xl h-[120px]', className)} {...props}>
        {children}
      </div>
    </React.Fragment>
  )
}

export default React.memo(GlassCard)
