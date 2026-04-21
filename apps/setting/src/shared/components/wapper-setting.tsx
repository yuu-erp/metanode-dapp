'use client'
import { cn } from '@/shared/lib/utils'
import * as React from 'react'

interface WapperSettingProps extends React.HTMLAttributes<HTMLDivElement> {}
function WapperSetting({ className, children, ...props }: WapperSettingProps) {
  return (
    <div className={cn('w-full p-2 background-card rounded-2xl', className)} {...props}>
      {children}
    </div>
  )
}

export default React.memo(WapperSetting)
