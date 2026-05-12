import { cn } from '@/lib'
import { memo } from 'react'

export type UserStatusProps = {
  value: string
}

export const UserStatus = memo(({ value }: UserStatusProps) => {
  const color = value === 'active' ? 'bg-green-400' : 'bg-red-400'

  return (
    <div className="flex items-center gap-2">
      <div className={cn('size-1.5 rounded-full', color)} />
      <p>{value}</p>
    </div>
  )
})
