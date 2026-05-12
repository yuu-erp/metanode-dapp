import { cn, copy } from '@/lib'
import { memo } from 'react'

export type CopyableProps = { className?: string; children: string }

export const Copyable = memo(({ children, className }: CopyableProps) => {
  return (
    <div onClick={() => copy(children)} className={cn(className)}>
      {children}
    </div>
  )
})
